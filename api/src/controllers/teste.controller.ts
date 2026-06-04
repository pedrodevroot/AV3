import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { testeService } from '../services/teste.service';
import { noContent, ok, created } from '../utils/response';

export const testeController = {
  listar: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await testeService.listar(req.params['codigo'] as string));
  }),

  criar: asyncHandler(async (req: Request, res: Response) => {
    created(res, await testeService.criar(req.params['codigo'] as string, req.body));
  }),

  remover: asyncHandler(async (req: Request, res: Response) => {
    await testeService.remover(req.params['codigo'] as string, req.params['testeId'] as string);
    noContent(res);
  }),
};
