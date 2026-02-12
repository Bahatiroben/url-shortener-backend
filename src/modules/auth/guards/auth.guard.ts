import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException("Invalid token");
        }
        try {
            const decodedPayload = await this.jwtService.verifyAsync(token);
            request.user =  decodedPayload;
            return true;
        } catch (err) {
            console.log("Extracted token:", err);
            throw new UnauthorizedException("Invalid token");
        }
    }

    extractTokenFromHeader(request: Request): string | undefined {
        const [tokenType, token] = request.headers['authorization']?.split(' ') ?? [];
        return tokenType === 'Bearer' ? token : undefined;
    }
}