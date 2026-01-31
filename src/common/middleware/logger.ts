import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const message = `${method} ${originalUrl}`;
    const start = Date.now();

    Logger.verbose(message, 'IncomingRequest');

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const responseMessage = `[${new Date().toISOString()}] ${method} ${originalUrl} - ${statusCode} - ${duration}ms`;
      Logger.verbose(responseMessage, 'OutgoingResponse');
    });

    next();
  }
}
