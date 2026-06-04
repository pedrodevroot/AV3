import { Router } from 'express';
import { NivelPermissao } from '@prisma/client';
import { testeController } from '../controllers/teste.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { createTesteSchema } from '../schemas/teste.schema';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', testeController.listar);

router.post(
  '/',
  authorize(NivelPermissao.ENGENHEIRO),
  validate({ body: createTesteSchema }),
  testeController.criar,
);

router.delete('/:testeId', authorize(NivelPermissao.ENGENHEIRO), testeController.remover);

export default router;
