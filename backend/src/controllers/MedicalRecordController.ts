import { Request, Response } from 'express';
import { MedicalRecord } from '../models/MedicalRecord';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { User } from '../models/User';

export class MedicalRecordController {
  /**
   * @swagger
   * /api/medical-records:
   *   get:
   *     summary: Lista todos os prontuários médicos
   *     tags: [MedicalRecords]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: patientId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID do paciente
   *       - in: query
   *         name: doctorId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID do médico
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Itens por página
   *     responses:
   *       200:
   *         description: Lista de prontuários médicos
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 medicalRecords:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/MedicalRecord'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     total:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   */
  static async index(req: Request, res: Response) {
    try {
      const { patientId, doctorId, page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const whereClause: any = {};
      if (patientId) whereClause.patientId = patientId;
      if (doctorId) whereClause.doctorId = doctorId;

      const { count, rows: medicalRecords } = await MedicalRecord.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Patient,
            as: 'patient',
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
          },
          {
            model: Doctor,
            as: 'doctor',
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
          }
        ],
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      const totalPages = Math.ceil(count / Number(limit));

      res.json({
        medicalRecords,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          totalPages
        }
      });
    } catch (error) {
      console.error('Erro ao listar prontuários médicos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/medical-records/{id}:
   *   get:
   *     summary: Busca um prontuário médico por ID
   *     tags: [MedicalRecords]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do prontuário médico
   *     responses:
   *       200:
   *         description: Prontuário médico encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MedicalRecord'
   *       404:
   *         description: Prontuário médico não encontrado
   */
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const medicalRecord = await MedicalRecord.findByPk(id, {
        include: [
          {
            model: Patient,
            as: 'patient',
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
          },
          {
            model: Doctor,
            as: 'doctor',
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
          }
        ]
      });

      if (!medicalRecord) {
        return res.status(404).json({ error: 'Prontuário médico não encontrado' });
      }

      res.json(medicalRecord);
    } catch (error) {
      console.error('Erro ao buscar prontuário médico:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/medical-records:
   *   post:
   *     summary: Cria um novo prontuário médico
   *     tags: [MedicalRecords]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - patientId
   *               - doctorId
   *               - diagnosis
   *               - treatment
   *               - notes
   *               - recordDate
   *             properties:
   *               patientId:
   *                 type: integer
   *               doctorId:
   *                 type: integer
   *               diagnosis:
   *                 type: string
   *               treatment:
   *                 type: string
   *               notes:
   *                 type: string
   *               recordDate:
   *                 type: string
   *                 format: date
   *     responses:
   *       201:
   *         description: Prontuário médico criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MedicalRecord'
   *       400:
   *         description: Dados inválidos
   */
  static async store(req: Request, res: Response) {
    try {
      const { patientId, doctorId, diagnosis, treatment, notes, recordDate } = req.body;

      // Verificar se o paciente existe
      const patient = await Patient.findByPk(patientId);
      if (!patient) {
        return res.status(400).json({ error: 'Paciente não encontrado' });
      }

      // Verificar se o médico existe
      const doctor = await Doctor.findByPk(doctorId);
      if (!doctor) {
        return res.status(400).json({ error: 'Médico não encontrado' });
      }

      const medicalRecord = await MedicalRecord.create({
        patient_id: patientId,
        doctor_id: doctorId,
        diagnosis,
        treatment,
        observations: notes,
        follow_up_date: recordDate
      });

      const createdRecord = await MedicalRecord.findByPk(medicalRecord.id, {
        include: [
          {
            model: Patient,
            as: 'patient',
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
          },
          {
            model: Doctor,
            as: 'doctor',
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
          }
        ]
      });

      res.status(201).json(createdRecord);
    } catch (error) {
      console.error('Erro ao criar prontuário médico:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/medical-records/{id}:
   *   put:
   *     summary: Atualiza um prontuário médico
   *     tags: [MedicalRecords]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do prontuário médico
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               diagnosis:
   *                 type: string
   *               treatment:
   *                 type: string
   *               notes:
   *                 type: string
   *               recordDate:
   *                 type: string
   *                 format: date
   *     responses:
   *       200:
   *         description: Prontuário médico atualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MedicalRecord'
   *       404:
   *         description: Prontuário médico não encontrado
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { diagnosis, treatment, notes, recordDate } = req.body;

      const medicalRecord = await MedicalRecord.findByPk(id);
      if (!medicalRecord) {
        return res.status(404).json({ error: 'Prontuário médico não encontrado' });
      }

      await medicalRecord.update({
        diagnosis,
        treatment,
        observations: notes,
        follow_up_date: recordDate
      });

      const updatedRecord = await MedicalRecord.findByPk(id, {
        include: [
          {
            model: Patient,
            as: 'patient',
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
          },
          {
            model: Doctor,
            as: 'doctor',
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
          }
        ]
      });

      res.json(updatedRecord);
    } catch (error) {
      console.error('Erro ao atualizar prontuário médico:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/medical-records/{id}:
   *   delete:
   *     summary: Remove um prontuário médico
   *     tags: [MedicalRecords]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do prontuário médico
   *     responses:
   *       200:
   *         description: Prontuário médico removido com sucesso
   *       404:
   *         description: Prontuário médico não encontrado
   */
  static async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const medicalRecord = await MedicalRecord.findByPk(id);
      if (!medicalRecord) {
        return res.status(404).json({ error: 'Prontuário médico não encontrado' });
      }

      await medicalRecord.destroy();
      res.json({ message: 'Prontuário médico removido com sucesso' });
    } catch (error) {
      console.error('Erro ao remover prontuário médico:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}