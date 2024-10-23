import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';

@Injectable()
export class Utils {
    // this functionality should be migrated to a middleware that checks the payments and other criterias and attach the response to the body of the request.
    getUrlValidUntilDate(): Date {
        throw new Error('Method not implemented.');
    }

    createShortUrl(): String {
        return crypto.randomBytes(10).toString('hex');
    }
}