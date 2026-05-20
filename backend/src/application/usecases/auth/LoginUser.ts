import { UserRepository } from '../../../domain/repositories/UserRepository';
import { PasswordHasher } from '../../../domain/services/PasswordHasher';
import { DomainError } from '../../../domain/errors/DomainError';
import { signToken } from '../../../infrastructure/config/jwt';
import { PublicUser, toPublicUser } from '../../dtos/UserDto';

export type LoginUserInput = {
  email: string;
  password: string;
};

export type LoginUserOutput = {
  token: string;
  user: PublicUser;
};

export class LoginUser {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new DomainError('Credenciales inválidas', 401);
    }

    const isValid = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new DomainError('Credenciales inválidas', 401);
    }

    const token = signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    return { token, user: toPublicUser(user) };
  }
}
