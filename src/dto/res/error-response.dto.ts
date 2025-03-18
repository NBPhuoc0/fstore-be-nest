export class ErrorResponseDto {
  statusCode: number;
  message: string;
  error: string;
  timestamp: Date;

  constructor(statusCode: number, message: string, error: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    this.timestamp = new Date();
  }
}
