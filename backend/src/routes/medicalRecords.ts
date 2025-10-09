import { Router } from 'express';
import { MedicalRecordController } from '../controllers/MedicalRecordController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: MedicalRecords
 *   description: Gerenciamento de prontuários médicos
 */

// Rotas para visualização (admin, doctor, patient - com restrições)
router.get('/', roleMiddleware(['admin', 'doctor']), MedicalRecordController.index);
router.get('/:id', roleMiddleware(['admin', 'doctor', 'patient']), MedicalRecordController.show);

// Rotas para criação e atualização (admin, doctor)
router.post('/', roleMiddleware(['admin', 'doctor']), MedicalRecordController.store);
router.put('/:id', roleMiddleware(['admin', 'doctor']), MedicalRecordController.update);

// Rotas administrativas (apenas admin)
router.delete('/:id', roleMiddleware(['admin']), MedicalRecordController.destroy);

export default router;