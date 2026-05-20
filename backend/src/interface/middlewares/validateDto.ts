import { Request, Response, NextFunction } from 'express';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { DomainError } from '../../domain/errors/DomainError';

type Source = 'body' | 'query' | 'params';

const flattenErrors = (errors: ValidationError[], parentPath = ''): string[] => {
  const messages: string[] = [];
  for (const err of errors) {
    const path = parentPath ? `${parentPath}.${err.property}` : err.property;
    if (err.constraints) {
      for (const constraint of Object.values(err.constraints)) {
        messages.push(`${path}: ${constraint}`);
      }
    }
    if (err.children && err.children.length > 0) {
      messages.push(...flattenErrors(err.children, path));
    }
  }
  return messages;
};

export const validateDto = <T extends object>(
  DtoClass: ClassConstructor<T>,
  source: Source = 'body'
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const payload = req[source] ?? {};
    const instance = plainToInstance(DtoClass, payload, {
      enableImplicitConversion: false,
    });

    const errors = await validate(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      stopAtFirstError: false,
    });

    if (errors.length > 0) {
      return next(
        new DomainError(
          `Datos inválidos: ${flattenErrors(errors).join('; ')}`,
          400
        )
      );
    }

    (req as any)[source] = instance;
    next();
  };
};
