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
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer() server: Server;
  private users: Map<string, { socketId: string, nickname: string }> = new Map();

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('sendMessage')
async handleMessage(
  @MessageBody() data: { channel: string, message: string }, 
  @ConnectedSocket() client: Socket
) {
  try {
    console.log('Received message:', data);
    
    // Use client ID as nickname if no user model exists
    const nickname = client.id;

    // Prepare the message data
    const messageData = {
      sender: nickname,
      content: data.message,
      channel: data.channel
    };

    // Log the message before broadcasting
    console.log('Broadcasting message:', messageData);

    // Explicitly broadcast to all clients in the channel
    this.server.to(data.channel).emit('message', messageData);

    return { 
      success: true, 
      message: 'Message sent successfully' 
    };
  } catch (error) {
    console.error('Error in handleMessage:', error);
    return { 
      success: false, 
      message: 'Failed to send message' 
    };
  }
}

@SubscribeMessage('setNickname')
async handleSetNickname(
  @MessageBody() nickname: string,
  @ConnectedSocket() client: Socket,
) {
  console.log(`Client ${client.id} attempting to set nickname: ${nickname}`);

  
  // Vérifier si le nickname est déjà utilisé
  const existingUser = Array.from(this.users.values()).find(u => u.nickname === nickname);
  if (existingUser) {
    return { 
      success: false, 
      message: 'Ce pseudo est déjà utilisé' 
    };
  }

  // Supprimer l'ancien nickname si existant
  const existingEntry = Array.from(this.users.entries()).find(([_, user]) => user.socketId === client.id);
  if (existingEntry) {
    this.users.delete(existingEntry[0]);
  }

  // Stocker l'utilisateur
  this.users.set(nickname, { socketId: client.id, nickname });
  client.data.nickname = nickname;


  return { 
    success: true, 
    message: `Nickname set to ${nickname}` 
  };
}

@SubscribeMessage('listChannels')
async handleListChannels(@MessageBody() filter?: string) {
  const result = await this.chatService.listChannels(filter);
  return result;
}

  @SubscribeMessage('createChannel')
  async handleCreateChannel(@MessageBody() channelName: string) {
    const result = await this.chatService.createChannel(channelName);
    
    if (result.success) {
      this.server.emit('updateChannelList');
    }
    
    return result;
  }

  @SubscribeMessage('deleteChannel')
  async handleDeleteChannel(@MessageBody() channelName: string) {
    const result = await this.chatService.deleteChannel(channelName);
    
    if (result.success) {
      this.server.emit('updateChannelList');
    }
    
    return result;
  }
  @SubscribeMessage('joinChannel')
async handleJoinChannel(
  @MessageBody() channelName: string,
  @ConnectedSocket() client: Socket,
) {
  console.log(`Client ${client.id} attempting to join channel: ${channelName}`);
  
  try {
    // Join the socket room
    client.join(channelName);

    // Broadcast join message to the channel
    this.server.to(channelName).emit('message', {
      sender: 'System',
      content: `${client.id} a rejoint le canal`,
      system: true,
      channel: channelName
    });

    return { 
      success: true, 
      message: `Joined channel ${channelName}` 
    };
  } catch (error) {
    console.error('Error joining channel:', error);
    return { 
      success: false, 
      message: 'Failed to join channel' 
    };
  }
}

  @SubscribeMessage('quitChannel')
  async handleQuitChannel(
    @MessageBody() channelName: string,
    @ConnectedSocket() client: Socket,
  ) {
    return this.chatService.quitChannel(client, channelName);
  }

  
  @SubscribeMessage('listUsers')
  async handleListUsers(@MessageBody() channelName: string) {
    return this.chatService.listUsers(this.server, channelName);
  }

  
  @SubscribeMessage('privateMessage')
async handlePrivateMessage(
  @MessageBody() data: { recipient: string; message: string },
  @ConnectedSocket() client: Socket
) {
  try {
    console.log('Private message received:', data);
 
    // Debugging logs
    console.log('DEBUG: Users map:', this.users);
    console.log('DEBUG: Server sockets:', this.server.sockets.sockets);
 
    // Find the sender
    const senderUser = Array.from(this.users.entries()).find(
      ([_, user]) => user.socketId === client.id
    );
 
    if (!senderUser) {
      return {
        success: false,
        message: 'Expéditeur non identifié. Définissez d\'abord un pseudo.'
      };
    }
 
    const senderNickname = senderUser[0]; // Nickname is the key in the Map
 
    // Find the recipient
    const recipientUser = this.users.get(data.recipient);
 
    if (!recipientUser) {
      return {
        success: false,
        message: 'Destinataire non trouvé'
      };
    }
 
    // Find the recipient's socket safely
    const recipientSocket = this.server.sockets?.sockets?.get(recipientUser?.socketId);
    if (!recipientSocket) {
      console.error(`Socket not found for user: ${data.recipient}`);
      return {
        success: false,
        message: 'Impossible de trouver le socket du destinataire'
      };
    }
 
    // Send private message
    recipientSocket.emit('privateMessage', {
      sender: senderNickname,
      content: data.message
    });
 
    return {
      success: true,
      message: 'Message privé envoyé'
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message privé:', error);
    return {
      success: false,
      message: 'Échec de l\'envoi du message privé'
    };
  }
}


  @SubscribeMessage('listAllUsers')
  handleListAllUsers() {
    const userList = Array.from(this.users.keys());
    return {
      success: true,
      message: userList.join(', ')
    };
  }

  @SubscribeMessage('channelMessage')
  async handleChannelMessage(
    @MessageBody() data: { channelName: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    return this.chatService.sendChannelMessage(client, data.channelName, data.message);
  }
}