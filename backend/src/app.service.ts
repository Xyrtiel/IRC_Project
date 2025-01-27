import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MongoClient } from 'mongodb';

@Injectable()
export class AppService {
  private readonly dbClient = new MongoClient('mongodb://127.0.0.1:27017');
  private db;
  private channelsCollection;

  constructor() {
    this.dbClient.connect();
    this.db = this.dbClient.db('chatApp');
    this.channelsCollection = this.db.collection('channels');
  }

  // Récupérer les channels
  async getChannels() {
    return this.channelsCollection.find().toArray();
  }

  // Créer un channel
  async createChannel(name: string) {
    await this.channelsCollection.insertOne({ name, members: [] });
    return { message: `Channel "${name}" created.` };
  }

  // Joindre un channel
  async joinChannel(channelName: string) {
    const channel = await this.channelsCollection.findOne({ name: channelName });
    if (channel) {
      return { message: `You have joined the channel "${channelName}".` };
    }
    throw new Error('Channel not found.');
  }
}
