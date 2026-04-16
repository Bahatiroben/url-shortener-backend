export interface RedirectResult {
  longUrl: string;
  shortKey: string;
  title?: string;
  expiresAt?: Date;
  passwordHash?: string;
  isActive: boolean;
}