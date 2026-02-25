import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data && data.__raw) {
          const { __raw, ...rest } = data;
          return rest;
        }

        return {
          success: true,
          data: data?.data !== undefined ? data.data : data,
          message: data?.message || 'Operación realizada con éxito',
        };
      }),
    );
  }
}
