import { Request, Response, NextFunction } from 'express';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { BcryptPasswordHasher } from '../../infrastructure/security/BcryptPasswordHasher';
import { RegisterUser } from '../../application/usecases/auth/RegisterUser';
import { LoginUser } from '../../application/usecases/auth/LoginUser';

const userRepository = new PrismaUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const registerUser = new RegisterUser(userRepository, passwordHasher);
const loginUser = new LoginUser(userRepository, passwordHasher);

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const user = await registerUser.execute({ name, email, password });
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser.execute({ email, password });
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};
