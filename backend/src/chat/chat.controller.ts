import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getChat() {
    return { message: 'Accès autorisé au chat' };
  }

  // Route pour créer un canal
  @Post('create-channel')
  @UseGuards(JwtAuthGuard)  // Protection via le guard JWT
  async createChannel(
    @Body() body: { channelName: string; creatorPseudo: string }
  ) {
    try {
      // On passe un unique objet regroupant les deux paramètres
      const channel = await this.chatService.createChannel({
        channelName: body.channelName,
        creatorPseudo: body.creatorPseudo,
      });
      return { success: true, channel };  // Renvoie le canal créé
    } catch (error) {
      return { success: false, message: error.message };  // Renvoie l'erreur le cas échéant
    }
  }
}
