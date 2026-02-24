import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor global de respuestas.
 * Equivalente a un middleware de respuesta en FastAPI.
 * Envuelve automáticamente TODA respuesta exitosa con el formato estándar:
 * { success: true, data: ..., message: "..." }
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Si el servicio ya devuelve { data, message }, lo respetamos
        // Si devuelve cualquier otra cosa, lo envolvemos
        if (data && data.__raw) {
          // escape hatch: si el servicio devuelve { __raw: true, ... } no envolvemos
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
