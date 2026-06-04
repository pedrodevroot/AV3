import { Router } from 'express';
import { NivelPermissao } from '@prisma/client';
import { relatorioController } from '../controllers/relatorio.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { createRelatorioSchema } from '../schemas/relatorio.schema';

const router = Router({ mergeParams: true });

router.use(authenticate, authorize(NivelPermissao.ENGENHEIRO));

router.get('/', relatorioController.listar);
router.get('/:relatorioId', relatorioController.buscarPorId);
router.post('/', validate({ body: createRelatorioSchema }), relatorioController.gerar);

export default router;
