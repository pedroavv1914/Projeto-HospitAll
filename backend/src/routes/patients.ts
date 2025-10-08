import { Router } from 'express';
import { PatientController } from '../controllers/PatientController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Gerenciamento de pacientes
 */

// Rotas públicas (para usuários autenticados)
router.get('/', roleMiddleware(['admin', 'doctor']), PatientController.index);
router.get('/:id', PatientController.show);
router.get('/:id/appointments', PatientController.getAppointments);
router.get('/:id/medical-records', PatientController.getMedicalRecords);

// Rotas administrativas (apenas admin)
router.post('/', roleMiddleware(['admin']), PatientController.store);
router.put('/:id', roleMiddleware(['admin', 'patient']), PatientController.update);
router.delete('/:id', roleMiddleware(['admin']), PatientController.destroy);

export default router;