import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { metricsStore } from '../middlewares/metrics';

export const metricsController = {
  resumo: asyncHandler(async (_req: Request, res: Response) => {
    const resumo = metricsStore.resumo();

    if (!resumo) {
      res.json({
        mensagem: 'Nenhuma métrica coletada ainda.',
        resumo: null,
      });
      return;
    }

    res.json({ resumo });
  }),

  limpar: asyncHandler(async (_req: Request, res: Response) => {
    metricsStore.limpar();
    res.json({ mensagem: 'Métricas zeradas com sucesso.' });
  }),
};
