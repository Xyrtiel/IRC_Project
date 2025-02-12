import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Socket, Server } from 'socket.io';
import { Channel } from './schemas/channel.schema';
import { Message } from './schemas/message.schema';
import { User } from './schemas/user.schema';

@Injectable()
export class ChatService {

  constructor(
    @InjectModel(Channel.name) private channelModel: Model<Channel>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async setNickname(client: Socket, nickname: string) {
    console.log(`Setting nickname ${nickname} for client ${client.id}`);
    try {
      let user = await this.userModel.findOne({ socketId: client.id });
      if (!user) {
        user = new this.userModel({ socketId: client.id, nickname });
      } else {
        user.nickname = nickname;
      }
      await user.save();
      console.log(`Nickname set successfully for client ${client.id}`);
      return { success: true, message: `Nickname set to ${nickname}` };
    } catch (error) {
      console.error('Error setting nickname:', error);
      return { success: false, message: 'Failed to set nickname' };
    }
  }
  
  async listChannels(filter?: string) {
    try {
      let query = this.channelModel.find();
      if (filter) {
        query = query.where('name', new RegExp(filter, 'i'));
      }
      const channels = await query.exec();
      
      return { 
        success: true, 
        message: channels.map(c => c.name).join(', ') 
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to list channels' 
      };
    }
  }

async handleMessage(data: { channel: string, message: string }, client: Socket) {
  const user = await this.userModel.findOne({ socketId: client.id });
  const nickname = user ? user.nickname : 'Anonymous';
  
  // Create a message object
  const messageData = {
    sender: nickname,
    content: data.message,
    channel: data.channel
  };

  return {
    event: 'message',
    data: messageData
  };
}

  async createChannel(channelName: string) {
    const channel = new this.channelModel({ name: channelName });
    await channel.save();
    return { success: true, message: `Channel ${channelName} created` };
  }

  async deleteChannel(channelName: string) {
    await this.channelModel.deleteOne({ name: channelName });
    return { success: true, message: `Channel ${channelName} deleted` };
  }

  async joinChannel(client: Socket, channelName: string) {
    console.log(`Joining channel ${channelName} for client ${client.id}`);
    
    // Find or create the channel if it doesn't exist
    let channel = await this.channelModel.findOne({ name: channelName });
    if (!channel) {
      channel = new this.channelModel({ name: channelName });
      await channel.save();
    }
    
    // Find the user associated with the client
    const user = await this.userModel.findOne({ socketId: client.id });
    const nickname = user ? user.nickname : 'Anonymous';
    
    // Join the channel socket room
    await client.join(channelName);
    console.log(`Client ${client.id} joined channel ${channelName}`);
    
    // Broadcast to other users in the channel
    client.to(channelName).emit('message', {
      sender: 'System',
      content: `${nickname} a rejoint le canal`,
      system: true,
      channel: channelName
    });
    
    return { 
      success: true, 
      message: `Joined channel ${channelName}`,
      channel: channelName
    };
  }

  async quitChannel(client: Socket, channelName: string) {
    try {
      console.log(`Attempting to quit channel: ${channelName} for client: ${client.id}`);
  
      // Leave the channel socket room
      client.leave(channelName);
      
      // Broadcast that user has left the channel
      client.to(channelName).emit('userLeft', { 
        user: client.id, 
        channel: channelName 
      });
  
      return { 
        success: true, 
        message: `Left channel ${channelName}` 
      };
    } catch (error) {
      console.error('Error in quitChannel:', error);
      return { 
        success: false, 
        message: 'Failed to quit channel' 
      };
    }
  }
  

  async listUsers(server: Server, channelName: string) {
    try {
      console.log(`Listing users for channel: ${channelName}`);
  
      // Find all clients in this channel
      const socketsInChannel = await server.in(channelName).fetchSockets();
      
      // Récupérer les nicknames des sockets
      const userNicknames = socketsInChannel
        .map(socket => socket.data.nickname)
        .filter(nickname => nickname); 
      
      console.log('Users in channel:', userNicknames);
  
      return { 
        success: true, 
        message: userNicknames.join(', ') 
      };
    } catch (error) {
      console.error('Error listing users:', error);
      return { 
        success: false, 
        message: 'Failed to list users' 
      };
    }
  }

  async sendPrivateMessage(client: Socket, targetNickname: string, message: string) {
    try {
      // Find the sender
      const sender = await this.userModel.findOne({ socketId: client.id });
      if (!sender) {
        return { success: false, message: 'Sender not found' };
      }
  
      // Find the target user
      const target = await this.userModel.findOne({ nickname: targetNickname });
      if (!target) {
        return { success: false, message: 'User not found' };
      }
  
      // Create and save the message
      const newMessage = new this.messageModel({
        sender: sender._id,
        recipient: target._id,
        content: message,
      });
      await newMessage.save();
  
      return { 
        success: true, 
        message: 'Private message sent',
        recipient: target.socketId 
      };
    } catch (error) {
      console.error('Error sending private message:', error);
      return { 
        success: false, 
        message: 'Failed to send private message' 
      };
    }
  }


  async sendChannelMessage(client: Socket, channelName: string, message: string) {
    // Find the sender
    const user = await this.userModel.findOne({ socketId: client.id });
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Find the channel
    const channel = await this.channelModel.findOne({ name: channelName });
    if (!channel) {
      return { success: false, message: 'Channel not found' };
    }

    // Create and save the message
    const newMessage = new this.messageModel({
      sender: user._id,
      channel: channel._id,
      content: message,
    });
    await newMessage.save();

    return { success: true, message: 'Channel message sent' };
  }
}