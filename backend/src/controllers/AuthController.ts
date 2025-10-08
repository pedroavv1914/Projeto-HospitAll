import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { JWTUtils } from '../utils/jwt';
import { validationResult } from 'express-validator';

export class AuthController {
  /**
   * Login do usuário
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array(),
        });
        return;
      }

      const { email, password } = req.body;

      // Buscar usuário por email
      const user = await User.findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos',
        });
        return;
      }

      // Verificar se o usuário está ativo
      if (!user.is_active) {
        res.status(401).json({
          error: 'Conta desativada',
          message: 'Sua conta foi desativada. Entre em contato com o administrador.',
        });
        return;
      }

      // Verificar senha
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos',
        });
        return;
      }

      // Gerar tokens
      const accessToken = JWTUtils.generateToken(user);
      const refreshToken = JWTUtils.generateRefreshToken(user);

      // Atualizar último login (se necessário, adicione este campo ao modelo)
      // await user.update({ last_login: new Date() });

      res.status(200).json({
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          cpf: user.cpf,
          phone: user.phone,
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'Bearer',
          expires_in: process.env.JWT_EXPIRES_IN || '7d',
        },
      });
    } catch (error: any) {
      console.error('Erro no login:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha no processo de login',
      });
    }
  }

  /**
   * Registro de novo usuário
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array(),
        });
        return;
      }

      const { name, email, password, cpf, phone, role = 'patient' } = req.body;

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

      // Criar novo usuário
      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password, // Será hasheado automaticamente pelo hook beforeCreate
        cpf,
        phone,
        role,
        is_active: true,
      });

      // Gerar tokens
      const accessToken = JWTUtils.generateToken(newUser);
      const refreshToken = JWTUtils.generateRefreshToken(newUser);

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          cpf: newUser.cpf,
          phone: newUser.phone,
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'Bearer',
          expires_in: process.env.JWT_EXPIRES_IN || '7d',
        },
      });
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Tratar erros específicos do Sequelize
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
        message: 'Falha no processo de registro',
      });
    }
  }

  /**
   * Refresh do token de acesso
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        res.status(400).json({
          error: 'Refresh token requerido',
          message: 'Forneça um refresh token válido',
        });
        return;
      }

      // Verificar refresh token
      const payload = JWTUtils.verifyRefreshToken(refresh_token);

      // Buscar usuário
      const user = await User.findByPk(payload.id);

      if (!user || !user.is_active) {
        res.status(401).json({
          error: 'Usuário não encontrado ou inativo',
          message: 'Refresh token válido mas usuário não existe ou está desativado',
        });
        return;
      }

      // Gerar novos tokens
      const newAccessToken = JWTUtils.generateToken(user);
      const newRefreshToken = JWTUtils.generateRefreshToken(user);

      res.status(200).json({
        message: 'Tokens renovados com sucesso',
        tokens: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          token_type: 'Bearer',
          expires_in: process.env.JWT_EXPIRES_IN || '7d',
        },
      });
    } catch (error: any) {
      console.error('Erro no refresh token:', error);
      res.status(401).json({
        error: 'Refresh token inválido',
        message: error.message || 'Falha na renovação do token',
      });
    }
  }

  /**
   * Logout (invalidar token - implementação básica)
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Em uma implementação mais robusta, você poderia:
      // 1. Manter uma blacklist de tokens
      // 2. Usar Redis para armazenar tokens inválidos
      // 3. Implementar um sistema de revogação de tokens

      res.status(200).json({
        message: 'Logout realizado com sucesso',
        note: 'Token permanece válido até expirar. Para invalidação imediata, implemente uma blacklist.',
      });
    } catch (error: any) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha no processo de logout',
      });
    }
  }

  /**
   * Verificar se o token é válido
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      // Se chegou até aqui, o token é válido (middleware de auth já verificou)
      const user = req.user!;

      res.status(200).json({
        message: 'Token válido',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          cpf: user.cpf,
          phone: user.phone,
        },
        token_info: req.tokenPayload,
      });
    } catch (error: any) {
      console.error('Erro na verificação do token:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha na verificação do token',
      });
    }
  }

  /**
   * Alterar senha
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array(),
        });
        return;
      }

      const { current_password, new_password } = req.body;
      const user = req.user!;

      // Verificar senha atual
      const isCurrentPasswordValid = await user.validatePassword(current_password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          error: 'Senha atual incorreta',
          message: 'A senha atual fornecida está incorreta',
        });
        return;
      }

      // Atualizar senha
      await user.update({ password: new_password });

      res.status(200).json({
        message: 'Senha alterada com sucesso',
      });
    } catch (error: any) {
      console.error('Erro na alteração de senha:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha na alteração da senha',
      });
    }
  }
}