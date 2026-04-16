import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '../dto/response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    let message = 'An error occurred';
    let error = undefined;
    let errors = undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      message = (exceptionResponse as any).message || message;
      error = (exceptionResponse as any).error;
      errors = (exceptionResponse as any).errors || (exceptionResponse as any).validationErrors;
    }

    response
      .status(status)
      .json(
        ApiErrorResponse.error(
          message,
          error,
          errors,
        ),
      );
  }
}