import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  pseudo: string;

  @IsEmail({}, { message: 'L’email doit être valide' })
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }) // Optionnel : impose un mot de passe de min. 6 caractères
  password: string;
}
