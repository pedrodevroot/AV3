import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authService } from '../services/auth.service';

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { usuario, senha } = req.body as { usuario: string; senha: string };
    const result = await authService.login(usuario, senha);
    res.status(200).json(result);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    res.json({ funcionario: req.user });
  }),
};
