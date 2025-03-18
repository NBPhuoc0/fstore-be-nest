import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TypeORMError } from 'typeorm';
import e, { Response } from 'express';
import { ErrorResponseDto } from 'src/dto/res/error-response.dto';

@Catch(TypeORMError)
export class TypeORMExceptionFilter implements ExceptionFilter {
  catch(exception: TypeORMError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = 500;

    const error = new ErrorResponseDto(
      status,
      exception.message,
      exception.name,
    );

    response.status(status).json(error);
  }
}
