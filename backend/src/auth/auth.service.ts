import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async registerUser(dto: RegisterDto): Promise<User> {
    if (!dto.password) {
      throw new BadRequestException('Le mot de passe ne peut pas être vide');
    }

    const user = new this.userModel({
      pseudo: dto.pseudo,
      email: dto.email,
      password: dto.password, // Hashage automatique par le pré-save hook
    });

    return user.save();
  }

  async loginUser(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    const payload = { userId: user._id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
