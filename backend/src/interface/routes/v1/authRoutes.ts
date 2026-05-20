import { Router } from 'express';
import { login, register } from '../../controllers/authController';
import { validateDto } from '../../middlewares/validateDto';
import { RegisterUserDto } from '../../../infrastructure/validators/auth/RegisterUserDto';
import { LoginUserDto } from '../../../infrastructure/validators/auth/LoginUserDto';

const router = Router();

router.post('/register', validateDto(RegisterUserDto), register);
router.post('/login', validateDto(LoginUserDto), login);

export default router;
