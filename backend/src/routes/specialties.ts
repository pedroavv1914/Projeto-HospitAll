import { Router } from 'express';
import { SpecialtyController } from '../controllers/SpecialtyController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Specialties
 *   description: Gerenciamento de especialidades médicas
 */

// Rotas públicas (para usuários autenticados)
router.get('/', SpecialtyController.index);
router.get('/:id', SpecialtyController.show);
router.get('/:id/doctors', SpecialtyController.getDoctors);

// Rotas administrativas (apenas admin)
router.post('/', roleMiddleware(['admin']), SpecialtyController.store);
router.put('/:id', roleMiddleware(['admin']), SpecialtyController.update);
router.delete('/:id', roleMiddleware(['admin']), SpecialtyController.destroy);

export default router;