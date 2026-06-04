import { Request, Response, NextFunction } from 'express';
import { NivelPermissao } from '@prisma/client';
import { AppError } from '../errors/AppError';

const HIERARQUIA: NivelPermissao[] = [
  NivelPermissao.OPERADOR,
  NivelPermissao.ENGENHEIRO,
  NivelPermissao.ADMINISTRADOR,
];

export function authorize(nivelMinimo: NivelPermissao) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Não autenticado', 401));
      return;
    }

    const nivelUsuario = HIERARQUIA.indexOf(req.user.nivelPermissao);
    const nivelNecessario = HIERARQUIA.indexOf(nivelMinimo);

    if (nivelUsuario < nivelNecessario) {
      next(new AppError('Permissão insuficiente', 403));
      return;
    }

    next();
  };
}
