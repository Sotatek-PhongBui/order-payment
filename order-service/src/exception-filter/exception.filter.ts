import { Catch, ArgumentsHost, Logger, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      this.logger.error(
        `[HttpException] ${request.method} ${request.url} | Error: ${exception.message}`,
      );
      response.status(status).json({
        status: status,
        message: res,
        error: exception.name,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      this.logger.error(
        `[UnknownException] ${request.method} ${request.url} || Error: `,
        exception,
      );
      response.status(500).json({
        status: 500,
        message: 'Internal Server Error',
        error: 'Internal Server Error',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
