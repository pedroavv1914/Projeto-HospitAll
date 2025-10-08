import { Request, Response } from 'express';
import { User } from '../models/User';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

export class UserController {
  /**
   * Listar todos os usuários com paginação e filtros
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Parâmetros inválidos',
          details: errors.array(),
        });
        return;
      }

      const {
        page = 1,
        limit = 10,
        role,
        active,
        search,
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const whereClause: any = {};

      // Filtros
      if (role) {
        whereClause.role = role;
      }

      if (active !== undefined) {
        whereClause.is_active = active === 'true';
      }

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { cpf: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        limit: Number(limit),
        offset,
        order: [['created_at', 'DESC']],
        attributes: { exclude: ['password'] },
      });

      const totalPages = Math.ceil(count / Number(limit));

      res.status(200).json({
        message: 'Usuários listados com sucesso',
        data: users,
        pagination: {
          current_page: Number(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: Number(limit),
          has_next: Number(page) < totalPages,
          has_prev: Number(page) > 1,
        },
      });
    } catch (error: any) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao listar usuários',
      });
    }
  }

  /**
   * Buscar usuário por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'ID inválido',
          details: errors.array(),
        });
        return;
      }

      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Doctor,
            as: 'doctor',
            required: false,
          },
          {
            model: Patient,
            as: 'patient',
            required: false,
          },
        ],
      });

      if (!user) {
        res.status(404).json({
          error: 'Usuário não encontrado',
          message: `Usuário com ID ${id} não existe`,
        });
        return;
      }

      res.status(200).json({
        message: 'Usuário encontrado com sucesso',
        data: user,
      });
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao buscar usuário',
      });
    }
  }

  /**
   * Criar novo usuário
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array(),
        });
        return;
      }

      const { name, email, password, cpf, phone, role } = req.body;

      // Verificar se o email já existe
      const existingUserByEmail = await User.findOne({
        where: { email: email.toLowerCase() },
      });

      if (existingUserByEmail) {
        res.status(409).json({
          error: 'Email já cadastrado',
          message: 'Este email já está sendo usado por outro usuário',
        });
        return;
      }

      // Verificar se o CPF já existe
      const existingUserByCpf = await User.findOne({
        where: { cpf },
      });

      if (existingUserByCpf) {
        res.status(409).json({
          error: 'CPF já cadastrado',
          message: 'Este CPF já está sendo usado por outro usuário',
        });
        return;
      }

      // Criar usuário
      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        cpf,
        phone,
        role,
        is_active: true,
      });

      // Remover senha da resposta
      const userResponse = newUser.toJSON();
      delete userResponse.password;

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        data: userResponse,
      });
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);

      if (error.name === 'SequelizeValidationError') {
        res.status(400).json({
          error: 'Dados inválidos',
          details: error.errors.map((err: any) => ({
            field: err.path,
            message: err.message,
          })),
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao criar usuário',
      });
    }
  }

  /**
   * Atualizar usuário
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      // Buscar usuário
      const user = await User.findByPk(id);

      if (!user) {
        res.status(404).json({
          error: 'Usuário não encontrado',
          message: `Usuário com ID ${id} não existe`,
        });
        return;
      }

      // Verificar se email está sendo alterado e se já existe
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({
          where: {
            email: updateData.email.toLowerCase(),
            id: { [Op.ne]: id },
          },
        });

        if (existingUser) {
          res.status(409).json({
            error: 'Email já cadastrado',
            message: 'Este email já está sendo usado por outro usuário',
          });
          return;
        }

        updateData.email = updateData.email.toLowerCase();
      }

      // Verificar se CPF está sendo alterado e se já existe
      if (updateData.cpf && updateData.cpf !== user.cpf) {
        const existingUser = await User.findOne({
          where: {
            cpf: updateData.cpf,
            id: { [Op.ne]: id },
          },
        });

        if (existingUser) {
          res.status(409).json({
            error: 'CPF já cadastrado',
            message: 'Este CPF já está sendo usado por outro usuário',
          });
          return;
        }
      }

      // Atualizar usuário
      await user.update(updateData);

      // Buscar usuário atualizado sem a senha
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
      });

      res.status(200).json({
        message: 'Usuário atualizado com sucesso',
        data: updatedUser,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);

      if (error.name === 'SequelizeValidationError') {
        res.status(400).json({
          error: 'Dados inválidos',
          details: error.errors.map((err: any) => ({
            field: err.path,
            message: err.message,
          })),
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao atualizar usuário',
      });
    }
  }

  /**
   * Desativar usuário (soft delete)
   */
  static async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        res.status(404).json({
          error: 'Usuário não encontrado',
          message: `Usuário com ID ${id} não existe`,
        });
        return;
      }

      await user.update({ is_active: false });

      res.status(200).json({
        message: 'Usuário desativado com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao desativar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao desativar usuário',
      });
    }
  }

  /**
   * Reativar usuário
   */
  static async activate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        res.status(404).json({
          error: 'Usuário não encontrado',
          message: `Usuário com ID ${id} não existe`,
        });
        return;
      }

      await user.update({ is_active: true });

      res.status(200).json({
        message: 'Usuário reativado com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao reativar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao reativar usuário',
      });
    }
  }

  /**
   * Deletar usuário permanentemente (apenas admin)
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        res.status(404).json({
          error: 'Usuário não encontrado',
          message: `Usuário com ID ${id} não existe`,
        });
        return;
      }

      // Verificar se há dependências (appointments, medical records, etc.)
      // Esta verificação pode ser expandida conforme necessário

      await user.destroy();

      res.status(200).json({
        message: 'Usuário deletado permanentemente',
      });
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);

      if (error.name === 'SequelizeForeignKeyConstraintError') {
        res.status(409).json({
          error: 'Não é possível deletar usuário',
          message: 'Usuário possui registros associados (consultas, prontuários, etc.)',
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao deletar usuário',
      });
    }
  }

  /**
   * Obter perfil do usuário logado
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user!;

      const userProfile = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Doctor,
            as: 'doctor',
            required: false,
          },
          {
            model: Patient,
            as: 'patient',
            required: false,
          },
        ],
      });

      res.status(200).json({
        message: 'Perfil obtido com sucesso',
        data: userProfile,
      });
    } catch (error: any) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao obter perfil',
      });
    }
  }

  /**
   * Atualizar perfil do usuário logado
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array(),
        });
        return;
      }

      const user = req.user!;
      const { name, phone } = req.body; // Apenas campos que o usuário pode alterar

      await user.update({ name, phone });

      const updatedUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] },
      });

      res.status(200).json({
        message: 'Perfil atualizado com sucesso',
        data: updatedUser,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao atualizar perfil',
      });
    }
  }
}