import { UserRepository } from '../../../domain/repositories/UserRepository';
import { PasswordHasher } from '../../../domain/services/PasswordHasher';
import { DomainError } from '../../../domain/errors/DomainError';
import { PublicUser, toPublicUser } from '../../dtos/UserDto';

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export class RegisterUser {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher
  ) {}

  async execute(input: RegisterUserInput): Promise<PublicUser> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new DomainError('El correo ya está registrado', 409);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const created = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'user',
    });

    return toPublicUser(created);
  }
}
