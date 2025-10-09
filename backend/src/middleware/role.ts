import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para verificar roles de usuário
 */
export const roleMiddleware = (allowedRoles: Array<'admin' | 'doctor' | 'patient'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Verificar se o usuário está autenticado
      if (!req.user) {
        res.status(401).json({
          error: 'Usuário não autenticado',
          message: 'É necessário estar logado para acessar este recurso'
        });
        return;
      }

      // Verificar se o usuário tem o role necessário
      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          error: 'Acesso negado',
          message: `Acesso restrito. Roles permitidos: ${allowedRoles.join(', ')}`
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de role:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao verificar permissões do usuário'
      });
    }
  };
};

// Middleware específicos para cada role
export const adminOnly = roleMiddleware(['admin']);
export const doctorOnly = roleMiddleware(['doctor']);
export const patientOnly = roleMiddleware(['patient']);
export const doctorOrAdmin = roleMiddleware(['doctor', 'admin']);
export const allRoles = roleMiddleware(['admin', 'doctor', 'patient']);