import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { etapaService } from '../services/etapa.service';
import { noContent, ok, created } from '../utils/response';

export const etapaController = {
  listar: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await etapaService.listar(req.params['codigo'] as string));
  }),

  buscarPorId: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await etapaService.buscarPorId(req.params['codigo'] as string, req.params['etapaId'] as string));
  }),

  criar: asyncHandler(async (req: Request, res: Response) => {
    created(res, await etapaService.criar(req.params['codigo'] as string, req.body));
  }),

  atualizar: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await etapaService.atualizar(req.params['codigo'] as string, req.params['etapaId'] as string, req.body));
  }),

  iniciar: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await etapaService.iniciar(req.params['codigo'] as string, req.params['etapaId'] as string));
  }),

  finalizar: asyncHandler(async (req: Request, res: Response) => {
    ok(res, await etapaService.finalizar(req.params['codigo'] as string, req.params['etapaId'] as string));
  }),

  associarFuncionario: asyncHandler(async (req: Request, res: Response) => {
    const etapa = await etapaService.associarFuncionario(
      req.params['codigo'] as string,
      req.params['etapaId'] as string,
      req.body.funcionarioId,
    );
    ok(res, etapa);
  }),

  desassociarFuncionario: asyncHandler(async (req: Request, res: Response) => {
    await etapaService.desassociarFuncionario(
      req.params['codigo'] as string,
      req.params['etapaId'] as string,
      req.params['funcionarioId'] as string,
    );
    noContent(res);
  }),

  remover: asyncHandler(async (req: Request, res: Response) => {
    await etapaService.remover(req.params['codigo'] as string, req.params['etapaId'] as string);
    noContent(res);
  }),
};
