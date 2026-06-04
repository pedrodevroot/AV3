import { Request, Response } from 'express';
import { StatusOrdem, PrioridadeOrdem } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { ordemService } from '../services/ordem.service';
import { noContent, ok, created } from '../utils/response';

export const ordemController = {
  listar: asyncHandler(async (req: Request, res: Response) => {
    const status = req.query['status'] as StatusOrdem | undefined;
    const prioridade = req.query['prioridade'] as PrioridadeOrdem | undefined;
    ok(res, await ordemService.listar({ status, prioridade }));
  }),

  buscarPorId: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await ordemService.buscarPorId(req.params['id'] as string));
  }),

  criar: asyncHandler(async (req: Request, res: Response) => {
    created(res, await ordemService.criar(req.body, req.user!.id));
  }),

  atualizar: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await ordemService.atualizar(req.params['id'] as string, req.body));
  }),

  remover: asyncHandler(async (req: Request, res: Response) => {
    await ordemService.remover(req.params['id'] as string);
    noContent(res);
  }),

  adicionarPeca: asyncHandler(async (req: Request, res: Response) => {
    const { pecaId, quantidade } = req.body as { pecaId: string; quantidade: number };
    created(res, await ordemService.adicionarPeca(req.params['id'] as string, pecaId, quantidade));
  }),

  atualizarQuantidadePeca: asyncHandler(async (req: Request, res: Response) => {
    const { quantidade } = req.body as { quantidade: number };
    ok(res, await ordemService.atualizarQuantidadePeca(req.params['id'] as string, req.params['pecaId'] as string, quantidade));
  }),

  removerPeca: asyncHandler(async (req: Request, res: Response) => {
    await ordemService.removerPeca(req.params['id'] as string, req.params['pecaId'] as string);
    noContent(res);
  }),
};
