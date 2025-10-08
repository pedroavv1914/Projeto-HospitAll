import { Request, Response } from 'express';
import { Doctor } from '../models/Doctor';
import { User } from '../models/User';
import { Specialty } from '../models/Specialty';
import { Appointment } from '../models/Appointment';
import { Patient } from '../models/Patient';

export class DoctorController {
  /**
   * @swagger
   * /api/doctors:
   *   get:
   *     summary: Lista todos os médicos
   *     tags: [Doctors]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de médicos
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Doctor'
   */
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const doctors = await Doctor.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: Specialty,
            as: 'specialty',
            attributes: ['id', 'name', 'description']
          }
        ]
      });

      res.json(doctors);
    } catch (error) {
      console.error('Erro ao buscar médicos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/doctors/{id}:
   *   get:
   *     summary: Busca um médico por ID
   *     tags: [Doctors]
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
   *         description: Dados do médico
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Doctor'
   *       404:
   *         description: Médico não encontrado
   */
  static async show(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const doctor = await Doctor.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone', 'cpf']
          },
          {
            model: Specialty,
            as: 'specialty',
            attributes: ['id', 'name', 'description']
          }
        ]
      });

      if (!doctor) {
        res.status(404).json({ error: 'Médico não encontrado' });
        return;
      }

      res.json(doctor);
    } catch (error) {
      console.error('Erro ao buscar médico:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/doctors:
   *   post:
   *     summary: Cria um novo médico
   *     tags: [Doctors]
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
   *               - crm
   *               - specialty_id
   *             properties:
   *               user_id:
   *                 type: integer
   *               crm:
   *                 type: string
   *               specialty_id:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Médico criado com sucesso
   *       400:
   *         description: Dados inválidos
   */
  static async store(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, crm, specialty_id } = req.body;

      const doctor = await Doctor.create({
        user_id,
        crm,
        specialty_id
      });

      const doctorWithRelations = await Doctor.findByPk(doctor.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: Specialty,
            as: 'specialty',
            attributes: ['id', 'name', 'description']
          }
        ]
      });

      res.status(201).json(doctorWithRelations);
    } catch (error: any) {
      console.error('Erro ao criar médico:', error);
      
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
   * /api/doctors/{id}:
   *   put:
   *     summary: Atualiza um médico
   *     tags: [Doctors]
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
   *               crm:
   *                 type: string
   *               specialty_id:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Médico atualizado com sucesso
   *       404:
   *         description: Médico não encontrado
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { crm, specialty_id } = req.body;

      const doctor = await Doctor.findByPk(id);

      if (!doctor) {
        res.status(404).json({ error: 'Médico não encontrado' });
        return;
      }

      await doctor.update({
        crm: crm || doctor.crm,
        specialty_id: specialty_id || doctor.specialty_id
      });

      const updatedDoctor = await Doctor.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: Specialty,
            as: 'specialty',
            attributes: ['id', 'name', 'description']
          }
        ]
      });

      res.json(updatedDoctor);
    } catch (error: any) {
      console.error('Erro ao atualizar médico:', error);
      
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
   * /api/doctors/{id}:
   *   delete:
   *     summary: Remove um médico
   *     tags: [Doctors]
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
   *         description: Médico removido com sucesso
   *       404:
   *         description: Médico não encontrado
   */
  static async destroy(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const doctor = await Doctor.findByPk(id);

      if (!doctor) {
        res.status(404).json({ error: 'Médico não encontrado' });
        return;
      }

      await doctor.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover médico:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/doctors/{id}/appointments:
   *   get:
   *     summary: Lista consultas de um médico
   *     tags: [Doctors]
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
   *         description: Lista de consultas do médico
   */
  static async getAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const appointments = await Appointment.findAll({
        where: { doctor_id: id },
        include: [
          {
            model: Patient,
            as: 'patient',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            }]
          }
        ],
        order: [['appointment_date', 'ASC']]
      });

      res.json(appointments);
    } catch (error) {
      console.error('Erro ao buscar consultas do médico:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}