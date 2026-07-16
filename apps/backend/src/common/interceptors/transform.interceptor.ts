import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Response } from 'express';

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const res = context.switchToHttp().getResponse<Response>();
    if (res.headersSent) {
      return next.handle().pipe(map(() => undefined as unknown as ApiResponse<T>));
    }
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          const req = context.switchToHttp().getRequest();
          const limit = parseInt(req.query.limit as string) || 20;
          const offset = parseInt(req.query.offset as string) || 0;
          const page = Math.floor(offset / limit) + 1;
          const hasMore = data.length === limit;
          
          return {
            data,
            meta: { page, limit, hasMore },
            timestamp: new Date().toISOString(),
          } as any;
        }
        
        return {
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
