import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already an ApiResponse instance, return as-is
        if (data instanceof ApiResponse) {
          return data;
        }

        // Auto-wrap paginated responses if they have specific structure
        if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
          const { items, meta, ...rest } = data;
          return ApiResponse.success(items || data, 'Success', meta);
        }

        return ApiResponse.success(data);
      }),
    );
  }
}