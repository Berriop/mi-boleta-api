import 'express';
import { UserRole } from '../../domain/entities/User';

declare module 'express' {
  export interface Request {
    userId?: string;
    userName?: string;
    userEmail?: string;
    userRole?: UserRole;
  }
}
