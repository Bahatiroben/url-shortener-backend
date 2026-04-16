import { registerAs } from '@nestjs/config';

export default registerAs('postgres', () => ({
    port: parseInt(process.env.PORT) || 3000,
    databaseUrl: process.env.DATABASE_URL,
}));