import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';

export interface Response<T> {
  statusCode: number;
  timestamp: string;
  path: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    return next.handle().pipe(
      map((data) => {
        return {
          statusCode: 200,
          timestamp: new Date().toISOString(),
          path: request.url,
          data,
        };
      }),
    );
  }
}
