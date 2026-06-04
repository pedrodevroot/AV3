import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { funcionarioService } from '../services/funcionario.service';
import { noContent, ok, created } from '../utils/response';

export const funcionarioController = {
  listar: asyncHandler(async (_req: Request, res: Response) => {
    ok(res, await funcionarioService.listar());
  }),

  buscarPorId: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await funcionarioService.buscarPorId(req.params['id'] as string));
  }),

  criar: asyncHandler(async (req: Request, res: Response) => {
    created(res, await funcionarioService.criar(req.body));
  }),

  atualizar: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await funcionarioService.atualizar(req.params['id'] as string, req.body));
  }),

  remover: asyncHandler(async (req: Request, res: Response) => {
    await funcionarioService.remover(req.params['id'] as string);
    noContent(res);
  }),
};
