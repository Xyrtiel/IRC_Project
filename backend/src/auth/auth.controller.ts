import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user.schema';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<User> {
    console.log('📥 Requête reçue dans AuthController'); // Debugging
    return this.authService.registerUser(dto);
  }

  @Post('login') // 🔥 Vérifie que cette route existe !
  async login(@Body() dto: LoginDto) {
    return this.authService.loginUser(dto);
  }
}
