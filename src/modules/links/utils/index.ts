import { Injectable } from '@nestjs/common';
const crypto =require('crypto');

@Injectable()
export class Utils {
    // this functionality should be migrated to a middleware that checks the payments and other criterias and attach the response to the body of the request.
    getUrlValidUntilDate(): Date {
        return new Date()
    }

    createShortUrl(): String {
        return crypto.randomBytes(5).toString('hex');
    }
}