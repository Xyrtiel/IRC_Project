import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    // Autoriser plusieurs origines
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { channel: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    return this.chatService.handleMessage(data, client);
  }

  @SubscribeMessage('setNickname')
  async handleSetNickname(
    @MessageBody() nickname: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Client ${client.id} attempting to set nickname: ${nickname}`);
    // On récupère le token depuis le handshake du client
    const token = client.handshake?.auth?.token;
    const result = await this.chatService.setNickname(client, nickname, token);
    console.log('Set nickname result:', result);
    return result;
  }

  @SubscribeMessage('listChannels')
  async handleListChannels(@MessageBody() filter?: string) {
    return this.chatService.listChannels(filter);
  }

  @SubscribeMessage('createChannel')
  async handleCreateChannel(
    @MessageBody() channelName: string,
    @ConnectedSocket() client: Socket,
  ) {
    // Extraction du pseudo du créateur depuis le handshake
    const creatorPseudo = client.handshake?.auth?.nickname;
    if (!creatorPseudo) {
      return {
        success: false,
        message: 'Creator pseudo not provided. Please set nickname first.',
      };
    }
    // On transmet un objet conforme à la signature attendue par createChannel
    return this.chatService.createChannel({ channelName, creatorPseudo });
  }

  @SubscribeMessage('deleteChannel')
  async handleDeleteChannel(@MessageBody() channelName: string) {
    return this.chatService.deleteChannel(channelName);
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(
    @MessageBody() channelName: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Client ${client.id} attempting to join channel: ${channelName}`);
    // On récupère l'ID utilisateur depuis le handshake (ou ailleurs)
    const userId = client.handshake?.auth?.userId;
    const result = await this.chatService.joinChannel(client, channelName, userId);
    console.log('Join channel result:', result);
    return result;
  }

  @SubscribeMessage('quitChannel')
  async handleQuitChannel(
    @MessageBody() channelName: string,
    @ConnectedSocket() client: Socket,
  ) {
    // On récupère le pseudo depuis le handshake pour l'appel de quitChannel
    const pseudo = client.handshake?.auth?.nickname;
    return this.chatService.quitChannel(client, channelName, pseudo);
  }

  @SubscribeMessage('listUsers')
  async handleListUsers(@MessageBody() channelName: string) {
    // On transmet uniquement le nom du canal, conformément à la signature de listUsers
    return this.chatService.listUsers(channelName);
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody() data: { nickname: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Pour sendPrivateMessage, le premier argument doit être un string (le pseudo de l'expéditeur)
    const sender = client.handshake?.auth?.nickname;
    if (!sender) {
      return { success: false, message: 'Sender nickname not provided.' };
    }
    return this.chatService.sendPrivateMessage(sender, data.nickname, data.message);
  }

  @SubscribeMessage('channelMessage')
  async handleChannelMessage(
    @MessageBody() data: { channelName: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    return this.chatService.sendChannelMessage(client, data.channelName, data.message);
  }
}
