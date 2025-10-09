import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Gerenciamento de consultas médicas
 */

// Rotas públicas (para usuários autenticados)
router.get('/', AppointmentController.index);
router.get('/available-slots', AppointmentController.getAvailableSlots);
router.get('/:id', AppointmentController.show);

// Rotas para criação e atualização (admin, doctor, patient)
router.post('/', roleMiddleware(['admin', 'doctor', 'patient']), AppointmentController.store);
router.put('/:id', roleMiddleware(['admin', 'doctor', 'patient']), AppointmentController.update);

// Rotas administrativas (apenas admin)
router.delete('/:id', roleMiddleware(['admin']), AppointmentController.destroy);

export default router;