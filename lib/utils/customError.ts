export class CustomError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number, name?: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = name || 'CustomError';
  }
}