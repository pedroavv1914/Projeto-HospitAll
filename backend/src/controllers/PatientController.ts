import { Request, Response } from 'express';
import { Patient } from '../models/Patient';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import { Doctor } from '../models/Doctor';
import { MedicalRecord } from '../models/MedicalRecord';

export class PatientController {
  /**
   * @swagger
   * /api/patients:
   *   get:
   *     summary: Lista todos os pacientes
   *     tags: [Patients]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de pacientes
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Patient'
   */
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const patients = await Patient.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone', 'cpf']
          }
        ]
      });

      res.json(patients);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/patients/{id}:
   *   get:
   *     summary: Busca um paciente por ID
   *     tags: [Patients]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Dados do paciente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Patient'
   *       404:
   *         description: Paciente não encontrado
   */
  static async show(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const patient = await Patient.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone', 'cpf']
          }
        ]
      });

      if (!patient) {
        res.status(404).json({ error: 'Paciente não encontrado' });
        return;
      }

      res.json(patient);
    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/patients:
   *   post:
   *     summary: Cria um novo paciente
   *     tags: [Patients]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - user_id
   *               - birth_date
   *             properties:
   *               user_id:
   *                 type: integer
   *               birth_date:
   *                 type: string
   *                 format: date
   *               address:
   *                 type: string
   *               emergency_contact:
   *                 type: string
   *     responses:
   *       201:
   *         description: Paciente criado com sucesso
   *       400:
   *         description: Dados inválidos
   */
  static async store(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, birth_date, address, emergency_contact } = req.body;

      const patient = await Patient.create({
        user_id,
        birth_date,
        address,
        emergency_contact
      });

      const patientWithRelations = await Patient.findByPk(patient.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone', 'cpf']
          }
        ]
      });

      res.status(201).json(patientWithRelations);
    } catch (error: any) {
      console.error('Erro ao criar paciente:', error);
      
      if (error.name === 'SequelizeValidationError') {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.errors.map((err: any) => err.message) 
        });
        return;
      }

      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/patients/{id}:
   *   put:
   *     summary: Atualiza um paciente
   *     tags: [Patients]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               birth_date:
   *                 type: string
   *                 format: date
   *               address:
   *                 type: string
   *               emergency_contact:
   *                 type: string
   *     responses:
   *       200:
   *         description: Paciente atualizado com sucesso
   *       404:
   *         description: Paciente não encontrado
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { birth_date, address, emergency_contact } = req.body;

      const patient = await Patient.findByPk(id);

      if (!patient) {
        res.status(404).json({ error: 'Paciente não encontrado' });
        return;
      }

      await patient.update({
        birth_date: birth_date || patient.birth_date,
        address: address || patient.address,
        emergency_contact: emergency_contact || patient.emergency_contact
      });

      const updatedPatient = await Patient.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone', 'cpf']
          }
        ]
      });

      res.json(updatedPatient);
    } catch (error: any) {
      console.error('Erro ao atualizar paciente:', error);
      
      if (error.name === 'SequelizeValidationError') {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.errors.map((err: any) => err.message) 
        });
        return;
      }

      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/patients/{id}:
   *   delete:
   *     summary: Remove um paciente
   *     tags: [Patients]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Paciente removido com sucesso
   *       404:
   *         description: Paciente não encontrado
   */
  static async destroy(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const patient = await Patient.findByPk(id);

      if (!patient) {
        res.status(404).json({ error: 'Paciente não encontrado' });
        return;
      }

      await patient.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover paciente:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/patients/{id}/appointments:
   *   get:
   *     summary: Lista consultas de um paciente
   *     tags: [Patients]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Lista de consultas do paciente
   */
  static async getAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const appointments = await Appointment.findAll({
        where: { patient_id: id },
        include: [
          {
            model: Doctor,
            as: 'doctor',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }]
          }
        ],
        order: [['appointment_date', 'ASC']]
      });

      res.json(appointments);
    } catch (error) {
      console.error('Erro ao buscar consultas do paciente:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/patients/{id}/medical-records:
   *   get:
   *     summary: Lista prontuários médicos de um paciente
   *     tags: [Patients]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Lista de prontuários do paciente
   */
  static async getMedicalRecords(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const medicalRecords = await MedicalRecord.findAll({
        where: { patient_id: id },
        include: [
          {
            model: Doctor,
            as: 'doctor',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'name']
            }]
          },
          {
            model: Appointment,
            as: 'appointment',
            attributes: ['id', 'appointment_date']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json(medicalRecords);
    } catch (error) {
      console.error('Erro ao buscar prontuários do paciente:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}