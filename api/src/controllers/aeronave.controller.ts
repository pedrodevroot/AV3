import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { aeronaveService } from '../services/aeronave.service';
import { noContent, ok, created } from '../utils/response';

export const aeronaveController = {
  listar: asyncHandler(async (_req: Request, res: Response) => {
    ok(res, await aeronaveService.listar());
  }),

  buscarPorCodigo: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await aeronaveService.buscarPorCodigo(req.params['codigo'] as string));
  }),

  criar: asyncHandler(async (req: Request, res: Response) => {
    created(res, await aeronaveService.criar(req.body));
  }),

  atualizar: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await aeronaveService.atualizar(req.params['codigo'] as string, req.body));
  }),

  remover: asyncHandler(async (req: Request, res: Response) => {
    await aeronaveService.remover(req.params['codigo'] as string);
    noContent(res);
  }),
};
