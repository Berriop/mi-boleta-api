import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  password!: string;
}
