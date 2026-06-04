import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { pecaService } from '../services/peca.service';
import { noContent, ok, created } from '../utils/response';

export const pecaController = {
  listar: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await pecaService.listar(req.params['codigo'] as string));
  }),

  buscarPorId: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await pecaService.buscarPorId(req.params['codigo'] as string, req.params['pecaId'] as string));
  }),

  criar: asyncHandler(async (req: Request, res: Response) => {
    created(res, await pecaService.criar(req.params['codigo'] as string, req.body));
  }),

  atualizar: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await pecaService.atualizar(req.params['codigo'] as string, req.params['pecaId'] as string, req.body));
  }),

  remover: asyncHandler(async (req: Request, res: Response) => {
    await pecaService.remover(req.params['codigo'] as string, req.params['pecaId'] as string);
    noContent(res);
  }),
};
