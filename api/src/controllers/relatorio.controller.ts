import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { relatorioService } from '../services/relatorio.service';
import { ok, created } from '../utils/response';

export const relatorioController = {
  listar: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await relatorioService.listar(req.params['codigo'] as string));
  }),

  buscarPorId: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await relatorioService.buscarPorId(req.params['codigo'] as string, req.params['relatorioId'] as string));
  }),

  gerar: asyncHandler(async (req: Request, res: Response) => {
    created(res, await relatorioService.gerar(req.params['codigo'] as string, req.body));
  }),
};
