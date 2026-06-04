import { Router } from 'express';
import { NivelPermissao } from '@prisma/client';
import { aeronaveController } from '../controllers/aeronave.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { createAeronaveSchema, updateAeronaveSchema } from '../schemas/aeronave.schema';
import pecaRoutes from './peca.routes';
import etapaRoutes from './etapa.routes';
import testeRoutes from './teste.routes';
import relatorioRoutes from './relatorio.routes';

const router = Router();

router.use(authenticate);

router.get('/', aeronaveController.listar);
router.get('/:codigo', aeronaveController.buscarPorCodigo);

router.post(
  '/',
  authorize(NivelPermissao.ADMINISTRADOR),
  validate({ body: createAeronaveSchema }),
  aeronaveController.criar,
);

router.put(
  '/:codigo',
  authorize(NivelPermissao.ADMINISTRADOR),
  validate({ body: updateAeronaveSchema }),
  aeronaveController.atualizar,
);

router.delete('/:codigo', authorize(NivelPermissao.ADMINISTRADOR), aeronaveController.remover);

// Sub-rotas aninhadas
router.use('/:codigo/pecas', pecaRoutes);
router.use('/:codigo/etapas', etapaRoutes);
router.use('/:codigo/testes', testeRoutes);
router.use('/:codigo/relatorios', relatorioRoutes);

export default router;
