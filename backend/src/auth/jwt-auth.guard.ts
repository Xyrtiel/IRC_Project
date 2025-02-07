import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: any; // Ajout de la propriété `user`
  cookies?: { [key: string]: string }; // Ajout de la propriété `cookies`
  headers: Request["headers"]; // Correction : assure que headers est bien inclus
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Vérifie que headers et cookies existent bien avant de les utiliser
    const token =
      request.cookies?.token ||
      request.headers?.authorization?.split(' ')[1];

    if (!token) return false;

    try {
      const decoded = this.jwtService.verify(token);
      request.user = decoded;
      return true;
    } catch (error) {
      return false;
    }
  }
}
