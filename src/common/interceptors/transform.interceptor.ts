import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TransformedResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  TransformedResponse<T> | T
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<TransformedResponse<T> | T> {
    const statusCode = context
      .switchToHttp()
      .getResponse<Response>().statusCode;

    return next.handle().pipe(
      map((data): TransformedResponse<T> | T => {
        if (statusCode === 204) {
          return data;
        }
        return {
          data,
          statusCode,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
