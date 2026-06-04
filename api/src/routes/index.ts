import { Router } from 'express';
import authRoutes from './auth.routes';
import funcionarioRoutes from './funcionario.routes';
import aeronaveRoutes from './aeronave.routes';
import ordemRoutes from './ordem.routes';
import metricsRoutes from './metrics.routes';
import hangarRoutes from './hangar.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/funcionarios', funcionarioRoutes);
router.use('/aeronaves', aeronaveRoutes);
router.use('/ordens', ordemRoutes);
router.use('/metrics', metricsRoutes);
router.use('/hangar', hangarRoutes);

export default router;
