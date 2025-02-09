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
    console.log(`[sendMessage] Client ${client.id} sent a message in ${data.channel}`);
    return this.chatService.handleMessage(data, client);
  }

  @SubscribeMessage('setNickname')
  async handleSetNickname(
    @MessageBody() nickname: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Client ${client.id} attempting to set nickname: ${nickname}`);
    const token = client.handshake?.auth?.token;
    const result = await this.chatService.setNickname(client, nickname, token);
    console.log(`[setNickname] Result:`, result);
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
    const creatorPseudo = client.handshake?.auth?.nickname;
    if (!creatorPseudo) {
      return { success: false, message: 'Please set a nickname first.' };
    }
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
    const userId = client.handshake?.auth?.userId;
    const result = await this.chatService.joinChannel(client, channelName, userId);
    console.log(`[joinChannel] Result:`, result);
    return result;
  }

  @SubscribeMessage('quitChannel')
  async handleQuitChannel(
    @MessageBody() channelName: string,
    @ConnectedSocket() client: Socket,
  ) {
    const pseudo = client.handshake?.auth?.nickname;
    return this.chatService.quitChannel(client, channelName, pseudo);
  }

  @SubscribeMessage('listUsers')
  async handleListUsers(@MessageBody() channelName: string) {
    return this.chatService.listUsers(channelName);
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody() data: { nickname: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const sender = client.handshake?.auth?.nickname;
    if (!sender) {
      return { success: false, message: 'Sender nickname not provided.' };
    }

    console.log(`[privateMessage] ${sender} -> ${data.nickname}: ${data.message}`);
    this.server.to(data.nickname).emit('privateMessage', {
      sender,
      content: data.message,
    });

    return { success: true };
  }

  @SubscribeMessage('channelMessage')
  async handleChannelMessage(
    @MessageBody() data: { channelName: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const sender = client.handshake?.auth?.nickname || 'Anonymous';
    
    console.log(`[channelMessage] ${sender} -> #${data.channelName}: ${data.message}`);
    this.server.to(data.channelName).emit('channelMessage', {
      sender,
      content: data.message,
    });
  }
}
