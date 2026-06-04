import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const details = err.errors.map(e => ({
      campo: e.path.join('.'),
      mensagem: e.message,
    }));
    res.status(422).json({ error: 'Dados inválidos', details });
    return;
  }

  console.error('[Erro não tratado]', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
}
