import { Request, Response, NextFunction } from 'express';
import { JWTUtils, JWTPayload } from '../utils/jwt';
import { User } from '../models/User';

// Estender a interface Request para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: User;
      tokenPayload?: JWTPayload;
    }
  }
}

/**
 * Middleware de autenticação JWT
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        error: 'Token de acesso requerido',
        message: 'Forneça um token válido no header Authorization',
      });
      return;
    }

    // Verificar e decodificar o token
    const payload = JWTUtils.verifyToken(token);
    
    // Buscar o usuário no banco de dados
    const user = await User.findByPk(payload.id);
    
    if (!user || !user.is_active) {
      res.status(401).json({
        error: 'Usuário não encontrado ou inativo',
        message: 'Token válido mas usuário não existe ou está desativado',
      });
      return;
    }

    // Adicionar usuário e payload à requisição
    req.user = user;
    req.tokenPayload = payload;

    next();
  } catch (error: any) {
    res.status(401).json({
      error: 'Token inválido',
      message: error.message || 'Falha na autenticação',
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
export const requireRole = (...roles: Array<'admin' | 'doctor' | 'patient'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Usuário não autenticado',
        message: 'Execute o middleware de autenticação primeiro',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Acesso negado',
        message: `Acesso restrito para: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar se é admin
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware para verificar se é médico
 */
export const requireDoctor = requireRole('doctor');

/**
 * Middleware para verificar se é paciente
 */
export const requirePatient = requireRole('patient');

/**
 * Middleware para verificar se é médico ou admin
 */
export const requireDoctorOrAdmin = requireRole('doctor', 'admin');

/**
 * Middleware para verificar se é o próprio usuário ou admin
 */
export const requireOwnerOrAdmin = (userIdParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Usuário não autenticado',
      });
      return;
    }

    const requestedUserId = parseInt(req.params[userIdParam]);
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && currentUserId !== requestedUserId) {
      res.status(403).json({
        error: 'Acesso negado',
        message: 'Você só pode acessar seus próprios dados',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware opcional de autenticação (não falha se não houver token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (token) {
      const payload = JWTUtils.verifyToken(token);
      const user = await User.findByPk(payload.id);
      
      if (user && user.is_active) {
        req.user = user;
        req.tokenPayload = payload;
      }
    }

    next();
  } catch (error) {
    // Em caso de erro, apenas continue sem autenticar
    next();
  }
};

/**
 * Middleware para verificar se o token está próximo do vencimento
 */
export const checkTokenExpiry = (req: Request, res: Response, next: NextFunction): void => {
  if (req.tokenPayload) {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);
    
    if (token && JWTUtils.isTokenExpiringSoon(token, 60)) { // 60 minutos
      res.setHeader('X-Token-Expiring', 'true');
      res.setHeader('X-Token-Expiry-Warning', 'Token expira em menos de 1 hora');
    }
  }
  
  next();
};