import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class JWTGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService
    ) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
            const request = context.switchToHttp().getRequest();
            const token = this.extractTokenFromHeader(request);
            if (!token) {
                return false;
            }
            try {
                const decoded = this.jwtService.verify(token);
                request.user = decoded; // Attach user info to request
                return true;
            } catch (err) {
                return false;
            }

    }

    extractTokenFromHeader(request: any): string | null {
        const authHeader = request.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.slice(7, authHeader.length); // Remove 'Bearer ' prefix
        }
        return null;
    }
}