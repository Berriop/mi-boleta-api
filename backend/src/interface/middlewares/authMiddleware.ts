import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../infrastructure/config/jwt';
import { DomainError } from '../../domain/errors/DomainError';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return next(new DomainError('Token de autenticación requerido', 401));
  }

  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new DomainError('Formato de token inválido (esperado: Bearer <token>)', 401));
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.userName = payload.name;
    req.userEmail = payload.email;
    req.userRole = payload.role;
    next();
  } catch (error) {
    next(new DomainError('Token inválido o expirado', 401));
  }
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (req.userRole !== 'admin') {
    return next(new DomainError('Acceso restringido a administradores', 403));
  }
  next();
};
