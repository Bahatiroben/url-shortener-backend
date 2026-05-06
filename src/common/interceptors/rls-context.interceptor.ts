import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class RlsContextInterceptor implements NestInterceptor {
  constructor(private dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const teamId = request.headers['x-team-id']; // Get team ID from header
    const user = request.user; // Get user from JWT

    if (teamId && user && user.id) {
      // Set both session variables for RLS
      await this.dataSource.query(
        `SELECT set_config('app.current_team_id', $1, false), set_config('app.current_user_id', $2, false)`,
        [teamId, user.id],
      );
    }

    return next.handle();
  }
}
