import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface JWTPayload {
  id: number;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  iat?: number;
  exp?: number;
}

class JWTUtils {
  private static secret = process.env.JWT_SECRET || 'hospitall-secret-key';
  private static expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  private static refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  static generateToken(payload: object): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  /**
   * Verifica e decodifica um token JWT
   */
  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido');
      }
      throw new Error('Erro na verificação do token');
    }
  }

  /**
   * Extrai o token do header Authorization
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Gera um token de refresh (com validade maior)
   */
  static generateRefreshToken(user: User): string {
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.secret, { expiresIn: this.refreshExpiresIn });
  }

  /**
   * Verifica um refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Refresh token inválido');
      }
      throw new Error('Erro na verificação do refresh token');
    }
  }

  /**
   * Decodifica um token sem verificar a assinatura (para debug)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica se um token está próximo do vencimento
   */
  static isTokenExpiringSoon(token: string, minutesThreshold: number = 30): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      const thresholdInSeconds = minutesThreshold * 60;

      return timeUntilExpiry <= thresholdInSeconds;
    } catch (error) {
      return true;
    }
  }
}

export { JWTUtils, JWTPayload };