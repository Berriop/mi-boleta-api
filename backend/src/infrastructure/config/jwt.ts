import jwt from 'jsonwebtoken';
import { env } from './env';
import { UserRole } from '../../domain/entities/User';

export type JwtPayload = {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
};

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
