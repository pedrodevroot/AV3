import { Router } from 'express';
import { metricsController } from '../controllers/metrics.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.use(authenticate);

// Retorna resumo estatístico do tempo de processamento coletado
router.get('/', metricsController.resumo);

// Zera as métricas (usado antes de cada rodada de teste)
router.post('/clear', metricsController.limpar);

export default router;
