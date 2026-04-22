export const REDIS_KEYS = {
  ID_COUNTER: 'url_shortener:id_counter',
  KEY_BUFFER: 'url_shortener:key_buffer',
  PRELOAD_LOCK: 'url_shortener:preload_lock',
  REFILL_LOCK: 'url_shortener:refill_lock',
} as const;
 
// Tunables
export const BUFFER_SIZE = 1000;         // How many keys to generate per batch
export const REFILL_THRESHOLD = 0.2;     // Refill when buffer drops below 20%
export const LOCK_TTL_SECONDS = 15;      // Lock expiry — prevents deadlock on crash
export const COUNTER_SEED = 1_000_000;   // Start IDs here to ensure 7-char keys from day one
 