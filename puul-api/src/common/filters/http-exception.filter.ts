import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global de excepciones.
 * Equivalente a los "exception handlers" en FastAPI (@app.exception_handler)
 * Captura TODOS los errores HTTP y les da el formato estándar definido en la arquitectura.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Normaliza el campo "message" para que SIEMPRE sea un array de strings
    let messages: string[];
    if (typeof exceptionResponse === 'string') {
      messages = [exceptionResponse];
    } else if (typeof exceptionResponse === 'object') {
      const res = exceptionResponse as any;
      messages = Array.isArray(res.message) ? res.message : [res.message];
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error: HttpStatus[status],
      message: messages,
      path: request.url,
    });
  }
}
