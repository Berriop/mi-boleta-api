import client from '../prisma/client';
import { User, UserRole } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class PrismaUserRepository implements UserRepository {
  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const created = await client.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
      },
    });

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      passwordHash: created.passwordHash,
      role: created.role as UserRole,
      createdAt: created.createdAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await client.user.findUnique({
      where: { email },
    });

    if (!found) return null;

    return {
      id: found.id,
      name: found.name,
      email: found.email,
      passwordHash: found.passwordHash,
      role: found.role as UserRole,
      createdAt: found.createdAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    const found = await client.user.findUnique({
      where: { id },
    });

    if (!found) return null;

    return {
      id: found.id,
      name: found.name,
      email: found.email,
      passwordHash: found.passwordHash,
      role: found.role as UserRole,
      createdAt: found.createdAt,
    };
  }
}
