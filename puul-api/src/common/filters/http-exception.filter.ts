import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

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
