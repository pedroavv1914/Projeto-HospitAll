import { Request, Response } from 'express';
import { Specialty } from '../models/Specialty';
import { Doctor } from '../models/Doctor';
import { User } from '../models/User';

export class SpecialtyController {
  /**
   * @swagger
   * /api/specialties:
   *   get:
   *     summary: Lista todas as especialidades
   *     tags: [Specialties]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de especialidades
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Specialty'
   */
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const specialties = await Specialty.findAll({
        order: [['name', 'ASC']]
      });

      res.json(specialties);
    } catch (error) {
      console.error('Erro ao buscar especialidades:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/specialties/{id}:
   *   get:
   *     summary: Busca uma especialidade por ID
   *     tags: [Specialties]
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
   *         description: Dados da especialidade
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Specialty'
   *       404:
   *         description: Especialidade não encontrada
   */
  static async show(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const specialty = await Specialty.findByPk(id);

      if (!specialty) {
        res.status(404).json({ error: 'Especialidade não encontrada' });
        return;
      }

      res.json(specialty);
    } catch (error) {
      console.error('Erro ao buscar especialidade:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/specialties:
   *   post:
   *     summary: Cria uma nova especialidade
   *     tags: [Specialties]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Especialidade criada com sucesso
   *       400:
   *         description: Dados inválidos
   */
  static async store(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;

      const specialty = await Specialty.create({
        name,
        description
      });

      res.status(201).json(specialty);
    } catch (error: any) {
      console.error('Erro ao criar especialidade:', error);
      
      if (error.name === 'SequelizeValidationError') {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.errors.map((err: any) => err.message) 
        });
        return;
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ 
          error: 'Especialidade já existe', 
          details: 'Uma especialidade com este nome já foi cadastrada' 
        });
        return;
      }

      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/specialties/{id}:
   *   put:
   *     summary: Atualiza uma especialidade
   *     tags: [Specialties]
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
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Especialidade atualizada com sucesso
   *       404:
   *         description: Especialidade não encontrada
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const specialty = await Specialty.findByPk(id);

      if (!specialty) {
        res.status(404).json({ error: 'Especialidade não encontrada' });
        return;
      }

      await specialty.update({
        name: name || specialty.name,
        description: description !== undefined ? description : specialty.description
      });

      res.json(specialty);
    } catch (error: any) {
      console.error('Erro ao atualizar especialidade:', error);
      
      if (error.name === 'SequelizeValidationError') {
        res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.errors.map((err: any) => err.message) 
        });
        return;
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ 
          error: 'Especialidade já existe', 
          details: 'Uma especialidade com este nome já foi cadastrada' 
        });
        return;
      }

      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/specialties/{id}:
   *   delete:
   *     summary: Remove uma especialidade
   *     tags: [Specialties]
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
   *         description: Especialidade removida com sucesso
   *       404:
   *         description: Especialidade não encontrada
   *       400:
   *         description: Especialidade não pode ser removida (possui médicos associados)
   */
  static async destroy(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const specialty = await Specialty.findByPk(id);

      if (!specialty) {
        res.status(404).json({ error: 'Especialidade não encontrada' });
        return;
      }

      // Verificar se existem médicos associados a esta especialidade
      const doctorsCount = await Doctor.count({
        where: { specialty_id: id }
      });

      if (doctorsCount > 0) {
        res.status(400).json({ 
          error: 'Especialidade não pode ser removida', 
          details: `Existem ${doctorsCount} médico(s) associado(s) a esta especialidade` 
        });
        return;
      }

      await specialty.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover especialidade:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * @swagger
   * /api/specialties/{id}/doctors:
   *   get:
   *     summary: Lista médicos de uma especialidade
   *     tags: [Specialties]
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
   *         description: Lista de médicos da especialidade
   */
  static async getDoctors(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const doctors = await Doctor.findAll({
        where: { specialty_id: id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          }
        ],
        order: [[{ model: User, as: 'user' }, 'name', 'ASC']]
      });

      res.json(doctors);
    } catch (error) {
      console.error('Erro ao buscar médicos da especialidade:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}