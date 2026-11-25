// Error esperado de la API: trae el codigo HTTP y un codigo interno estable.
// Todo lo que NO sea un AppError se trata como error inesperado (500).
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}
