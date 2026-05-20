import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @Length(2, 80, { message: 'El nombre debe tener entre 2 y 80 caracteres' })
  name!: string;

  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;
}
