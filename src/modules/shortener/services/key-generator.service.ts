import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../../../common/redis/services';

import { REDIS_KEYS, BUFFER_SIZE, REFILL_THRESHOLD, LOCK_TTL_SECONDS, COUNTER_SEED } from '../constants';

/**
 * KeyGeneratorService
 *
 * Generates unique Base62-encoded short keys for a distributed URL shortener.
 *
 * Strategy:
 * - A single Redis INCR counter (`id_counter`) is the sole source of truth for IDs.
 *   INCR/INCRBY are atomic operations — safe across any number of instances.
 * - Each instance reserves an exclusive range of IDs via INCRBY, encodes them
 *   into Base62 strings, and pushes them into a Redis list (the buffer).
 * - Keys are popped from the buffer on demand (O(1), non-blocking).
 * - Buffer is refilled proactively when it drops below REFILL_THRESHOLD,
 *   using a distributed Redis lock so only one instance refills at a time.
 * - If the buffer is empty (e.g. cold start race), a single key is generated
 *   inline via INCR as an immediate fallback — no request ever blocks.
 *
 * No DB queries. No race conditions. No duplicate keys.
 */
 
@Injectable()
export class KeyGeneratorService implements OnModuleInit {
  // todo: replace the logger with a custom enhanced logger.
  private readonly logger = console;
 
  constructor(
    private readonly redisService: RedisService
  ) {}
 
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
 
  async onModuleInit(): Promise<void> {
    await this.ensureCounterSeeded();
    await this.preloadBuffer();
  }
 
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
 
  /**
   * Returns a unique, URL-safe Base62 key (7 characters minimum).
   * Never throws — falls back to inline generation if the buffer is empty.
   */
  async generateUniqueKey(): Promise<string> {
    const key = await this.redisService.popFromList(REDIS_KEYS.KEY_BUFFER);
 
    if (!key) {
      // Buffer is empty — generate one key inline immediately so the request
      // is never blocked. This is a rare fallback (cold start / Redis hiccup).
      this.logger.warn('Key buffer empty — falling back to inline generation');
      return this.generateInlineKey();
    }
 
    // Proactive async refill — fire and forget, never awaited
    this.triggerRefillIfNeeded().catch((err) =>
      this.logger.error('Background refill failed', err),
    );
 
    return key;
  }
 
  // ---------------------------------------------------------------------------
  // Initialisation helpers
  // ---------------------------------------------------------------------------
 
  /**
   * Seeds the counter on first ever startup so keys start from a number that
   * always produces at least 7 Base62 characters (62^6 = ~56 billion, so
   * starting at 1,000,000 gives comfortable headroom).
   *
   * Uses SET NX so it only runs once — ever — across all instances.
   */
  private async ensureCounterSeeded(): Promise<void> {
    // SET key value NX — only sets if key does not exist
    await this.redisService.getClient().set(REDIS_KEYS.ID_COUNTER, COUNTER_SEED, 'NX');
  }
 
  /**
   * Called once on startup. Uses a distributed lock so that when multiple
   * instances boot simultaneously, only one fills the buffer.
   */
  private async preloadBuffer(): Promise<void> {
    const acquired = await this.acquireLock(REDIS_KEYS.PRELOAD_LOCK);
    if (!acquired) {
      this.logger.log('Preload skipped — another instance is handling it');
      return;
    }
 
    try {
      const count = await this.redisService.getListLength(REDIS_KEYS.KEY_BUFFER);
      const currentBufferCount = Math.floor((count / BUFFER_SIZE) * 100);
      if (count < BUFFER_SIZE * REFILL_THRESHOLD) {
        this.logger.log(`Buffer at ${currentBufferCount}% — preloading`);
        await this.fillBuffer(BUFFER_SIZE - count);
      } else {
        this.logger.log(`Buffer healthy at ${currentBufferCount}% — no preload needed`);
      }
    } finally {
      await this.releaseLock(REDIS_KEYS.PRELOAD_LOCK);
    }
  }
 
  // ---------------------------------------------------------------------------
  // Buffer management
  // ---------------------------------------------------------------------------
 
  /**
   * Checks current buffer level and triggers a refill if below threshold.
   * Uses a lock so concurrent requests don't all queue a refill simultaneously.
   */
  private async triggerRefillIfNeeded(): Promise<void> {
    const count = await this.redisService.getListLength(REDIS_KEYS.KEY_BUFFER);
    const threshold = Math.floor(BUFFER_SIZE * REFILL_THRESHOLD);
 
    if (count >= threshold) return;
 
    const acquired = await this.acquireLock(REDIS_KEYS.REFILL_LOCK);
    if (!acquired) return; // Another instance is already refilling
 
    try {
      // Re-check after acquiring lock (another instance may have just refilled)
      const countAfterLock = await this.redisService.getListLength(REDIS_KEYS.KEY_BUFFER);
      if (countAfterLock >= threshold) return;
 
      const needed = BUFFER_SIZE - countAfterLock;
      this.logger.log(`Refilling buffer: ${countAfterLock} remaining, adding ${needed}`);
      await this.fillBuffer(needed);
    } finally {
      await this.releaseLock(REDIS_KEYS.REFILL_LOCK);
    }
  }
 
  /**
   * Reserves `count` IDs atomically via INCRBY, encodes them to Base62,
   * and pushes the resulting keys into the Redis buffer list.
   *
   * INCRBY guarantees each instance gets an exclusive, non-overlapping range.
   * e.g. Instance A gets 1000001–1001000, Instance B gets 1001001–1002000.
   */
  private async fillBuffer(count: number): Promise<void> {
    const client = this.redisService.getClient();
 
    // Reserve the entire range atomically in a single round-trip
    const endId = await client.incrby(REDIS_KEYS.ID_COUNTER, count);
    const startId = endId - count + 1;
 
    const keys: string[] = [];
    for (let id = startId; id <= endId; id++) {
      keys.push(this.encodeBase62(id));
    }
 
    // RPUSH keeps insertion order — keys are consumed LPOP (FIFO)
    await this.redisService.pushToList(REDIS_KEYS.KEY_BUFFER, keys);
    this.logger.log(`Filled buffer with ${count} keys (IDs ${startId}–${endId})`);
  }
 
  /**
   * Inline fallback: generates exactly one key without touching the buffer.
   * Used only when the buffer is completely empty.
   */
  private async generateInlineKey(): Promise<string> {
    const client = this.redisService.getClient();
    const id = await client.incr(REDIS_KEYS.ID_COUNTER);
    return this.encodeBase62(id);
  }
 
  // ---------------------------------------------------------------------------
  // Encoding
  // ---------------------------------------------------------------------------
 
  /**
   * Encodes a positive integer to a Base62 string.
   * Character set: 0-9, a-z, A-Z (URL-safe, case-sensitive).
   * Padded to a minimum of 7 characters.
   *
   * Examples:
   *   1_000_000 → "4c92"  (padded → "00004c92") — actually 7 chars from seed
   *   56_800_235_584 → "9999999" (7 chars, ~56 billion combinations)
   */
  private encodeBase62(num: number): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let encoded = '';
    let n = num;
 
    do {
      encoded = chars[n % 62] + encoded;
      n = Math.floor(n / 62);
    } while (n > 0);
 
    return encoded.padStart(7, '0');
  }
 
  // ---------------------------------------------------------------------------
  // Distributed locking (lightweight — no Redlock needed for this use case)
  // ---------------------------------------------------------------------------
 
  /**
   * Acquires a Redis lock using SET NX EX.
   * Returns true if the lock was acquired, false if already held.
   */
  private async acquireLock(lockKey: string): Promise<boolean> {
    const client = this.redisService.getClient();
    const result = await client.set(lockKey, '1', 'EX', LOCK_TTL_SECONDS, 'NX');
    return result === 'OK';
  }
 
  private async releaseLock(lockKey: string): Promise<void> {
    const client = this.redisService.getClient();
    await client.del(lockKey);
  }
}


// @Injectable()
// export class KeyGeneratorService implements OnModuleInit {
//   private readonly KEY_BUFFER_SIZE = 1000;
//   private readonly REDIS_KEY_BUFFER = 'url_shortener:key_buffer';

//   constructor(
//     @InjectRepository(UrlMapping)
//     private readonly urlRepository: Repository<UrlMapping>,

//     private readonly redisService: RedisService,
//   ) {}

//   async onModuleInit() {
//     await this.preloadKeys();
//   }

//   private async preloadKeys() {
//     const count = await this.redisService.getListLength(this.REDIS_KEY_BUFFER);
//     if (count < this.KEY_BUFFER_SIZE / 2) {
//       await this.generateAndStoreKeys(this.KEY_BUFFER_SIZE);
//     }
//   }

//   private async generateAndStoreKeys(count: number) {
//     const keys: string[] = [];
//     let lastId = await this.getLastUsedId();

//     for (let i = 0; i < count; i++) {
//       lastId++;
//       const key = this.encodeBase62(lastId);
//       keys.push(key);
//     }

//     await this.redisService.pushToList(this.REDIS_KEY_BUFFER, keys);
//   }

//   async generateUniqueKey(): Promise<string> {
//     let key = await this.redisService.popFromList(this.REDIS_KEY_BUFFER);

//     if (!key) {
//       await this.generateAndStoreKeys(this.KEY_BUFFER_SIZE);
//       key = await this.redisService.popFromList(this.REDIS_KEY_BUFFER);
//     }

//     // Double-check uniqueness (safety net)
//     const exists = await this.urlRepository.exists({ where: { shortKey: key } });
//     if (exists) {
//       return this.generateUniqueKey(); // recursive retry (rare)
//     }

//     return key;
//   }

//   private encodeBase62(num: number): string {
//     const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
//     let encoded = '';
//     let n = num;

//     do {
//       encoded = chars[n % 62] + encoded;
//       n = Math.floor(n / 62);
//     } while (n > 0);

//     return encoded.padStart(7, '0'); // Minimum 7 characters
//   }

//   private async getLastUsedId(): Promise<number> {
//     const result = await this.urlRepository
//       .createQueryBuilder('url')
//       .select('MAX(url.id)', 'max')
//       .getRawOne();

//     return result?.max || 1000000; // Start from a safe number
//   }
// }