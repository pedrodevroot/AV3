import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { NivelPermissao } from '@prisma/client';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

interface JwtPayload {
  id: string;
  usuario: string;
  nivelPermissao: NivelPermissao;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new AppError('Token não fornecido', 401));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = {
      id: payload.id,
      usuario: payload.usuario,
      nivelPermissao: payload.nivelPermissao,
    };
    next();
  } catch {
    next(new AppError('Token inválido ou expirado', 401));
  }
}
