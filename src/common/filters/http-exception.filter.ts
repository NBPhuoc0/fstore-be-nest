import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponseDto } from 'src/dto/res/error-response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const res: any = exception.getResponse();

    const error = new ErrorResponseDto(
      status,
      typeof res === 'string' ? res : (res as any).message,
      exception.name,
    );

    response.status(status).json(error);
  }
}
