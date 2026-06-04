import { Router } from 'express';
import { NivelPermissao } from '@prisma/client';
import { etapaController } from '../controllers/etapa.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import {
  createEtapaSchema,
  updateEtapaSchema,
  associarFuncionarioSchema,
} from '../schemas/etapa.schema';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', etapaController.listar);
router.get('/:etapaId', etapaController.buscarPorId);

router.post(
  '/',
  authorize(NivelPermissao.ENGENHEIRO),
  validate({ body: createEtapaSchema }),
  etapaController.criar,
);

router.put(
  '/:etapaId',
  authorize(NivelPermissao.ENGENHEIRO),
  validate({ body: updateEtapaSchema }),
  etapaController.atualizar,
);

router.patch('/:etapaId/iniciar', authorize(NivelPermissao.ENGENHEIRO), etapaController.iniciar);
router.patch('/:etapaId/finalizar', authorize(NivelPermissao.ENGENHEIRO), etapaController.finalizar);

router.post(
  '/:etapaId/funcionarios',
  authorize(NivelPermissao.ADMINISTRADOR),
  validate({ body: associarFuncionarioSchema }),
  etapaController.associarFuncionario,
);

router.delete(
  '/:etapaId/funcionarios/:funcionarioId',
  authorize(NivelPermissao.ADMINISTRADOR),
  etapaController.desassociarFuncionario,
);

router.delete('/:etapaId', authorize(NivelPermissao.ENGENHEIRO), etapaController.remover);

export default router;
