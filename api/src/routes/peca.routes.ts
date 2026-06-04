import { Router } from 'express';
import { NivelPermissao } from '@prisma/client';
import { pecaController } from '../controllers/peca.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { createPecaSchema, updatePecaSchema } from '../schemas/peca.schema';

// mergeParams: true para acessar :codigo da rota pai (aeronaves)
const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', pecaController.listar);
router.get('/:pecaId', pecaController.buscarPorId);
router.post('/', authorize(NivelPermissao.OPERADOR), validate({ body: createPecaSchema }), pecaController.criar);
router.put('/:pecaId', authorize(NivelPermissao.OPERADOR), validate({ body: updatePecaSchema }), pecaController.atualizar);
router.delete('/:pecaId', authorize(NivelPermissao.OPERADOR), pecaController.remover);

export default router;
