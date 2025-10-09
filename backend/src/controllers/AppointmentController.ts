import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { User } from '../models/User';
import { Specialty } from '../models/Specialty';
import { Op } from 'sequelize';

export class AppointmentController {
  /**
   * @swagger
   * /api/appointments:
   *   get:
   *     summary: Lista todas as consultas
   *     tags: [Appointments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [scheduled, completed, cancelled]
   *         description: Filtrar por status
   *       - in: query
   *         name: doctor_id
   *         schema:
   *           type: integer
   *         description: Filtrar por médico
   *       - in: query
   *         name: patient_id
   *         schema:
   *           type: integer
   *         description: Filtrar por paciente
   *     responses:
   *       200:
   *         description: Lista de consultas
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Appointment'
   */
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const { status, doctor_id, patient_id } = req.query;
      
      const whereClause: any = {};
      
      if (status) {
        whereClause.status = status;
      }
      
      if (doctor_id) {
        whereClause.doctor_id = doctor_id;
      }
      
      if (patient_id) {
        whereClause.patient_id = patient_id;
      }

      const appointments = await Appointment.findAll({
        where: whereClause,
        include: [
          {
            model: Doctor,
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
              },
              {
                model: Specialty,
                as: 'specialty',
                attributes: ['id', 'name']
              }
            ]
          },
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
      console.error('Erro ao buscar consultas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/appointments/{id}:
   *   get:
   *     summary: Busca uma consulta por ID
   *     tags: [Appointments]
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
   *         description: Dados da consulta
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Appointment'
   *       404:
   *         description: Consulta não encontrada
   */
  static async show(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findByPk(id, {
        include: [
          {
            model: Doctor,
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
              },
              {
                model: Specialty,
                as: 'specialty',
                attributes: ['id', 'name']
              }
            ]
          },
          {
            model: Patient,
            as: 'patient',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            }]
          }
        ]
      });

      if (!appointment) {
        res.status(404).json({ error: 'Consulta não encontrada' });
        return;
      }

      res.json(appointment);
    } catch (error) {
      console.error('Erro ao buscar consulta:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/appointments:
   *   post:
   *     summary: Cria uma nova consulta
   *     tags: [Appointments]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - doctor_id
   *               - patient_id
   *               - appointment_date
   *               - duration_minutes
   *             properties:
   *               doctor_id:
   *                 type: integer
   *               patient_id:
   *                 type: integer
   *               appointment_date:
   *                 type: string
   *                 format: date-time
   *               duration_minutes:
   *                 type: integer
   *               notes:
   *                 type: string
   *     responses:
   *       201:
   *         description: Consulta criada com sucesso
   *       400:
   *         description: Dados inválidos
   */
  static async store(req: Request, res: Response): Promise<void> {
    try {
      const { doctor_id, patient_id, appointment_date, duration_minutes, notes } = req.body;

      const appointment = await Appointment.create({
        doctor_id,
        patient_id,
        appointment_date,
        duration_minutes,
        notes,
        status: 'scheduled'
      });

      const appointmentWithRelations = await Appointment.findByPk(appointment.id, {
        include: [
          {
            model: Doctor,
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
              },
              {
                model: Specialty,
                as: 'specialty',
                attributes: ['id', 'name']
              }
            ]
          },
          {
            model: Patient,
            as: 'patient',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            }]
          }
        ]
      });

      res.status(201).json(appointmentWithRelations);
    } catch (error: any) {
      console.error('Erro ao criar consulta:', error);
      
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
   * /api/appointments/{id}:
   *   put:
   *     summary: Atualiza uma consulta
   *     tags: [Appointments]
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
   *               appointment_date:
   *                 type: string
   *                 format: date-time
   *               duration_minutes:
   *                 type: integer
   *               status:
   *                 type: string
   *                 enum: [scheduled, completed, cancelled]
   *               notes:
   *                 type: string
   *     responses:
   *       200:
   *         description: Consulta atualizada com sucesso
   *       404:
   *         description: Consulta não encontrada
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { appointment_date, duration_minutes, status, notes } = req.body;

      const appointment = await Appointment.findByPk(id);

      if (!appointment) {
        res.status(404).json({ error: 'Consulta não encontrada' });
        return;
      }

      await appointment.update({
        appointment_date: appointment_date || appointment.appointment_date,
        duration_minutes: duration_minutes || appointment.duration_minutes,
        status: status || appointment.status,
        notes: notes !== undefined ? notes : appointment.notes
      });

      const updatedAppointment = await Appointment.findByPk(id, {
        include: [
          {
            model: Doctor,
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
              },
              {
                model: Specialty,
                as: 'specialty',
                attributes: ['id', 'name']
              }
            ]
          },
          {
            model: Patient,
            as: 'patient',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            }]
          }
        ]
      });

      res.json(updatedAppointment);
    } catch (error: any) {
      console.error('Erro ao atualizar consulta:', error);
      
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
   * /api/appointments/{id}:
   *   delete:
   *     summary: Remove uma consulta
   *     tags: [Appointments]
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
   *         description: Consulta removida com sucesso
   *       404:
   *         description: Consulta não encontrada
   */
  static async destroy(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findByPk(id);

      if (!appointment) {
        res.status(404).json({ error: 'Consulta não encontrada' });
        return;
      }

      await appointment.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover consulta:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/appointments/available-slots:
   *   get:
   *     summary: Lista horários disponíveis para agendamento
   *     tags: [Appointments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: doctor_id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do médico
   *       - in: query
   *         name: date
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *         description: Data para verificar disponibilidade
   *     responses:
   *       200:
   *         description: Lista de horários disponíveis
   */
  static async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
      const { doctor_id, date } = req.query;

      if (!doctor_id || !date) {
        res.status(400).json({ error: 'doctor_id e date são obrigatórios' });
        return;
      }

      const startDate = new Date(`${date}T08:00:00`);
      const endDate = new Date(`${date}T18:00:00`);

      // Buscar consultas já agendadas para o médico na data
      const existingAppointments = await Appointment.findAll({
        where: {
          doctor_id: Number(doctor_id),
          appointment_date: {
            [Op.between]: [startDate, endDate]
          },
          status: {
            [Op.ne]: 'cancelled'
          }
        },
        order: [['appointment_date', 'ASC']]
      });

      // Gerar slots de 30 minutos das 8h às 18h
      const availableSlots = [];
      const current = new Date(startDate);

      while (current < endDate) {
        const slotTime = new Date(current);
        const isOccupied = existingAppointments.some(appointment => {
          const appointmentStart = new Date(appointment.appointment_date);
          const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.duration_minutes * 60000));
          return slotTime >= appointmentStart && slotTime < appointmentEnd;
        });

        if (!isOccupied) {
          availableSlots.push({
            time: slotTime.toISOString(),
            formatted: slotTime.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          });
        }

        current.setMinutes(current.getMinutes() + 30);
      }

      res.json(availableSlots);
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}