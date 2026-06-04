import { Router } from 'express';
import { NivelPermissao } from '@prisma/client';
import { ordemController } from '../controllers/ordem.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import {
  createOrdemSchema,
  updateOrdemSchema,
  addPecaOrdemSchema,
  updateQuantidadePecaSchema,
  ordemQuerySchema,
} from '../schemas/ordem.schema';

const router = Router();

router.use(authenticate);

router.get('/', validate({ query: ordemQuerySchema }), ordemController.listar);
router.get('/:id', ordemController.buscarPorId);

router.post(
  '/',
  authorize(NivelPermissao.ENGENHEIRO),
  validate({ body: createOrdemSchema }),
  ordemController.criar,
);

router.put(
  '/:id',
  authorize(NivelPermissao.ENGENHEIRO),
  validate({ body: updateOrdemSchema }),
  ordemController.atualizar,
);

router.delete('/:id', authorize(NivelPermissao.ADMINISTRADOR), ordemController.remover);

// Peças da ordem
router.post(
  '/:id/pecas',
  authorize(NivelPermissao.ENGENHEIRO),
  validate({ body: addPecaOrdemSchema }),
  ordemController.adicionarPeca,
);

router.patch(
  '/:id/pecas/:pecaId',
  authorize(NivelPermissao.ENGENHEIRO),
  validate({ body: updateQuantidadePecaSchema }),
  ordemController.atualizarQuantidadePeca,
);

router.delete(
  '/:id/pecas/:pecaId',
  authorize(NivelPermissao.ENGENHEIRO),
  ordemController.removerPeca,
);

export default router;
