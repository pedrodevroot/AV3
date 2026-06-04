import { Router } from 'express';
import { NivelPermissao } from '@prisma/client';
import { funcionarioController } from '../controllers/funcionario.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import {
  createFuncionarioSchema,
  updateFuncionarioSchema,
} from '../schemas/funcionario.schema';

const router = Router();

// Todas as rotas de funcionários exigem ADMINISTRADOR
router.use(authenticate, authorize(NivelPermissao.ADMINISTRADOR));

router.get('/', funcionarioController.listar);
router.get('/:id', funcionarioController.buscarPorId);
router.post('/', validate({ body: createFuncionarioSchema }), funcionarioController.criar);
router.put('/:id', validate({ body: updateFuncionarioSchema }), funcionarioController.atualizar);
router.delete('/:id', funcionarioController.remover);

export default router;
