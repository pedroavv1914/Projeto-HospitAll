import { Router } from 'express';
import { DoctorController } from '../controllers/DoctorController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Gerenciamento de médicos
 */

// Rotas públicas (para usuários autenticados)
router.get('/', DoctorController.index);
router.get('/:id', DoctorController.show);
router.get('/:id/appointments', DoctorController.getAppointments);

// Rotas administrativas (apenas admin)
router.post('/', roleMiddleware(['admin']), DoctorController.store);
router.put('/:id', roleMiddleware(['admin']), DoctorController.update);
router.delete('/:id', roleMiddleware(['admin']), DoctorController.destroy);

export default router;