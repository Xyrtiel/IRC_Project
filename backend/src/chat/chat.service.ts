import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { Channel } from './schemas/channel.schema';
import { Message } from './schemas/message.schema';
import { User } from '../users/user.schema';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';

@Injectable()
export class ChatService {
  handleMessage(data: { channel: string; message: string; }, client: Socket) {
    throw new Error('Method not implemented.');
  }
  private clients: Map<Socket, User> = new Map();

  constructor(
    @InjectModel(Channel.name) private channelModel: Model<Channel>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  // ✅ Vérification et validation du token utilisateur
  async validateToken(token: string): Promise<any> {
    console.log('Validating token...');
    try {
      const decoded = await this.jwtService.verifyAsync(token);
      console.log('Token decoded:', decoded);

      const user = await this.userModel.findById(decoded.userId);
      if (!user) throw new UnauthorizedException('User not found');

      console.log('User found:', user);
      return { userId: decoded.userId, email: user.email, pseudo: user.pseudo };
    } catch (error) {
      console.error('Error validating token:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  // ✅ Authentification utilisateur
  async authenticateUser(pseudo: string, password: string): Promise<User> {
    console.log(`Authenticating user: ${pseudo}`);
    const user = await this.userModel.findOne({ pseudo }).exec();
    if (!user) {
      console.error('User not found:', pseudo);
      throw new UnauthorizedException('Pseudo or password incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      console.error('Invalid password for user:', pseudo);
      throw new UnauthorizedException('Pseudo or password incorrect');
    }

    console.log('User authenticated:', user);
    return user;
  }

  // ✅ Associer un pseudo à un client (socket)
  async setNickname(client: Socket, pseudo: string, token: string) {
    console.log(`Setting nickname for client ${client.id} to ${pseudo}`);
    try {
      const userFromToken = await this.validateToken(token);
      console.log('User from token:', userFromToken);

      let user = await this.userModel.findOne({ email: userFromToken.email });
      if (!user) {
        console.log('Creating new user for email:', userFromToken.email);
        user = new this.userModel({ socketId: client.id, pseudo, email: userFromToken.email });
      } else {
        console.log('Updating existing user:', user);
        user.pseudo = pseudo;
        user.socketId = client.id;
      }

      await user.save();
      this.clients.set(client, user);
      console.log('Nickname set successfully:', pseudo);
      return { success: true, message: `Nickname set to ${pseudo}` };
    } catch (error) {
      console.error('Error setting nickname:', error);
      throw new BadRequestException('Failed to set nickname');
    }
  }

  // ✅ Rechercher un utilisateur par ID
  async findUserById(userId: string): Promise<User> {
    console.log('Finding user by ID:', userId);
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      console.error('User not found:', userId);
      throw new UnauthorizedException('User not found');
    }
    console.log('User found:', user);
    return user;
  }

  // ✅ Création et gestion des channels
  async createChannel(createChannelDto: { channelName: string; creatorPseudo: string }): Promise<Channel> {
    console.log(`Creating channel: ${createChannelDto.channelName}`);
  
    // Vérifier si un canal existe déjà avec ce nom
    const existingChannel = await this.channelModel.findOne({ name: createChannelDto.channelName }).exec();
    if (existingChannel) {
      console.error('Channel already exists:', createChannelDto.channelName);
      throw new BadRequestException('Channel already exists');
    }
  
    // Récupérer l'utilisateur à partir de son pseudo
    const creator = await this.userModel.findOne({ pseudo: createChannelDto.creatorPseudo }).exec();
    if (!creator) {
      console.error('Creator user not found:', createChannelDto.creatorPseudo);
      throw new BadRequestException('Creator user not found');
    }
  
    // Créer un nouveau canal avec l'ID de l'utilisateur comme `createdBy`
    const newChannel = new this.channelModel({
      name: createChannelDto.channelName,
      members: [creator._id],  // Ajouter le créateur en tant que membre
      createdBy: creator._id,  // Utiliser l'ID de l'utilisateur pour `createdBy`
    });
  
    // Sauvegarder le canal dans la base de données
    const savedChannel = await newChannel.save();
    console.log('Channel created successfully:', savedChannel);
  
    return savedChannel;
  }  

  async deleteChannel(channelName: string) {
    console.log(`Deleting channel: ${channelName}`);
    await this.channelModel.deleteOne({ name: channelName });
    console.log('Channel deleted:', channelName);
    return { success: true, message: `Channel ${channelName} deleted` };
  }

  async joinChannel(client: Socket, channelName: string, userId: string) {
    console.log(`User with ID ${userId} trying to join channel: ${channelName}`);
    try {
      const channel = await this.channelModel.findOne({ name: channelName });
      if (!channel) {
        return { success: false, message: 'Channel not found' };
      }
      // Cast pour accéder à la propriété members
      const channelAny = channel as any;
      if (!Array.isArray(channelAny.members)) {
        channelAny.members = [];
      }
  
      // Utiliser directement l'ID au lieu de chercher par pseudo
      const user = await this.userModel.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
  
      // Vérifier si l'utilisateur est déjà membre du canal
      const isMemberAlready = channelAny.members.some((member: any) =>
        member && member.toString() === userId
      );
  
      if (isMemberAlready) {
        return { success: true, message: `Already a member of ${channelName}` };
      }
  
      // Ajouter l'ID (converti en ObjectId) aux membres
      channelAny.members.push(new Types.ObjectId(userId));
      await channel.save();
  
      // Faire rejoindre le canal au client socket
      await client.join(channelName);
      
      // Émettre l'événement de jointure
      client.to(channelName).emit('userJoined', { 
        user: user.pseudo, 
        channel: channelName 
      });
  
      return { success: true, message: `Joined channel ${channelName}` };
    } catch (error) {
      console.error('Error joining channel:', error);
      return { success: false, message: 'Failed to join channel' };
    }
  }
  
  async quitChannel(client: Socket, channelName: string, pseudo: string) {
    console.log(`User ${pseudo} trying to quit channel: ${channelName}`);
    try {
      const channel = await this.channelModel.findOne({ name: channelName });
      if (!channel) {
        console.error('Channel not found:', channelName);
        return { success: false, message: 'Channel not found' };
      }

      const user = await this.userModel.findOne({ pseudo }).exec();
      if (!user) {
        console.error('User not found:', pseudo);
        return { success: false, message: 'User not found' };
      }

      console.log(`Removing user ${pseudo} from channel: ${channelName}`);
      // Cast pour accéder à la propriété members
      const channelAny = channel as any;
      if (!Array.isArray(channelAny.members)) {
        channelAny.members = [];
      }
      channelAny.members = channelAny.members.filter((member: any) => {
        // Certains éléments peuvent être déjà des ObjectId ou des objets avec _id
        const memberStr = member._id ? member._id.toString() : member.toString();
        return memberStr !== user._id.toString();
      });
      await channel.save();

      client.leave(channelName);
      client.to(channelName).emit('userLeft', { user: pseudo, channel: channelName });
      console.log(`User ${pseudo} left channel ${channelName}`);
      return { success: true, message: `Left channel ${channelName}` };
    } catch (error) {
      console.error('Error leaving channel:', error);
      return { success: false, message: 'Failed to leave channel' };
    }
  }

  // ✅ Liste des canaux avec un filtre optionnel
  async listChannels(filter?: string): Promise<Channel[]> {
    console.log('Listing all channels with filter:', filter);
    const query = filter ? { name: new RegExp(filter, 'i') } : {};
    return this.channelModel.find(query).exec();
  }

  async listUsers(channelName: string): Promise<User[]> {
    console.log(`Listing users for channel: ${channelName}`);
    const channel = await this.channelModel
      .findOne({ name: channelName })
      .populate<{ members: User[] }>('members')
      .exec();
  
    if (!channel) {
      console.error('Channel not found:', channelName);
      throw new BadRequestException('Channel not found');
    }
    // Cast pour accéder à members en cas d'erreur de typage
    const members = (channel as any).members || [];
    console.log(`Found ${members.length} users in channel ${channelName}`);
    return members;
  }

  // ✅ Messages de channel
  async sendChannelMessage(client: Socket, channelName: string, content: string) {
    console.log(`User ${client.id} sending message to channel ${channelName}: ${content}`);
    
    if (!content || content.trim() === '') {
      console.error('Invalid message: content is empty or undefined');
      return { success: false, message: 'Invalid message' };
    }
  
    const user = this.clients.get(client);
    if (!user) {
      console.error('User not found for socket', client.id);
      return { success: false, message: 'User not found for socket' };
    }
  
    const channel = await this.channelModel.findOne({ name: channelName });
    if (!channel) {
      console.error('Channel not found:', channelName);
      return { success: false, message: 'Channel not found' };
    }
  
    const newMessage = new this.messageModel({
      sender: user._id,
      channel: channel._id,
      content,
      timestamp: new Date(),
      isPrivate: false,
    });
    
    await newMessage.save();
    console.log('Message sent to channel:', newMessage);
  
    return newMessage;
  }

  // ✅ Messages privés
  async sendPrivateMessage(sender: string, recipient: string, content: string): Promise<Message> {
    console.log(`User ${sender} sending private message to ${recipient}: ${content}`);
    const senderUser = await this.userModel.findOne({ pseudo: sender }).exec();
    const recipientUser = await this.userModel.findOne({ pseudo: recipient }).exec();
    if (!senderUser || !recipientUser) {
      console.error('Sender or recipient not found:', sender, recipient);
      throw new UnauthorizedException('User not found');
    }

    const newMessage = new this.messageModel({
      sender: senderUser._id,
      recipient: recipientUser._id,
      content,
      timestamp: new Date(),
      isPrivate: true,
    });
    await newMessage.save();
    console.log('Private message sent:', newMessage);
    return newMessage;
  }

  async getPrivateMessages(sender: string, recipient: string): Promise<Message[]> {
    console.log(`Fetching private messages between ${sender} and ${recipient}`);
    return this.messageModel
      .find({ $or: [{ sender, recipient }, { sender: recipient, recipient: sender }] })
      .sort({ timestamp: 1 })
      .exec();
  }

  async deletePrivateMessage(messageId: string): Promise<boolean> {
    console.log(`Deleting private message with ID: ${messageId}`);
    const result = await this.messageModel.deleteOne({ _id: messageId }).exec();
    console.log('Private message deleted:', result);
    return result.deletedCount > 0;
  }
}
