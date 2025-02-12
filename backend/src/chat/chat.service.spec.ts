// import { Test, TestingModule } from '@nestjs/testing';
// import { MongooseModule } from '@nestjs/mongoose';
// import { MongoMemoryServer } from 'mongodb-memory-server';
// import { ChatService } from './chat.service';
// import { Channel, ChannelSchema } from './schemas/channel.schema';
// import { Message, MessageSchema } from './schemas/message.schema';
// import { User, UserSchema } from './schemas/user.schema';
// import { Socket } from 'socket.io';
// import mongoose from 'mongoose';

// // Singleton MongoDB Memory Server
// let mongod: MongoMemoryServer;

// describe('ChatService', () => {
//   let service: ChatService;
//   let moduleRef: TestingModule;

//   const mockSocket = {
//     id: 'test-socket-id',
//     join: jest.fn(),
//     leave: jest.fn(),
//     to: jest.fn(() => ({
//       emit: jest.fn(),
//     })),
//     data: {},
//   } as any as Socket;

//   // Setup once before all tests
//   beforeAll(async () => {
//     // Create MongoDB Memory Server only once
//     mongod = await MongoMemoryServer.create();
//     const uri = mongod.getUri();

//     moduleRef = await Test.createTestingModule({
//       imports: [
//         MongooseModule.forRoot(uri),
//         MongooseModule.forFeature([
//           { name: Channel.name, schema: ChannelSchema },
//           { name: Message.name, schema: MessageSchema },
//           { name: User.name, schema: UserSchema },
//         ]),
//       ],
//       providers: [ChatService],
//     }).compile();

//     service = moduleRef.get<ChatService>(ChatService);
//   }, 60000);

//   // Cleanup after all tests
//   afterAll(async () => {
//     await mongoose.connection.close();
//     await mongod.stop();
//   }, 60000);

//   // Clear database before each test
//   beforeEach(async () => {
//     const collections = await mongoose.connection.db.collections();
//     for (const collection of collections) {
//       await collection.deleteMany({});
//     }
//     jest.clearAllMocks();
//   });

//   describe('setNickname', () => {
//     it('should set a new nickname for a user', async () => {
//       const result = await service.setNickname(mockSocket, 'testUser');
//       expect(result.success).toBe(true);
//       expect(result.message).toContain('testUser');
//     });

//     it('should update existing user nickname', async () => {
//       await service.setNickname(mockSocket, 'firstNick');
//       const result = await service.setNickname(mockSocket, 'secondNick');
//       expect(result.success).toBe(true);
//       expect(result.message).toContain('secondNick');
//     });
//   });

//   describe('createChannel', () => {
//     it('should create a new channel', async () => {
//       const result = await service.createChannel('test-channel');
//       expect(result.success).toBe(true);
//       expect(result.message).toContain('test-channel');
//     });

//     it('should not create duplicate channels', async () => {
//       await service.createChannel('test-channel');
//       const result = await service.createChannel('test-channel');
//       expect(result.success).toBe(false);
//     });
//   });

//   describe('joinChannel', () => {
//     beforeEach(async () => {
//       await service.createChannel('test-channel');
//     });

//     it('should join an existing channel', async () => {
//       const result = await service.joinChannel(mockSocket, 'test-channel');
//       expect(result.success).toBe(true);
//       expect(mockSocket.join).toHaveBeenCalledWith('test-channel');
//     });

//     it('should create and join a non-existing channel', async () => {
//       const result = await service.joinChannel(mockSocket, 'new-channel');
//       expect(result.success).toBe(true);
//       expect(mockSocket.join).toHaveBeenCalledWith('new-channel');
//     });
//   });

//   describe('quitChannel', () => {
//     it('should allow user to quit channel', async () => {
//       const result = await service.quitChannel(mockSocket, 'test-channel');
//       expect(result.success).toBe(true);
//       expect(mockSocket.leave).toHaveBeenCalledWith('test-channel');
//     });
//   });

//   describe('sendChannelMessage', () => {
//     beforeEach(async () => {
//       await service.createChannel('test-channel');
//       await service.setNickname(mockSocket, 'test-user');
//     });

//     it('should send message to channel', async () => {
//       const result = await service.sendChannelMessage(
//         mockSocket,
//         'test-channel',
//         'test message'
//       );
//       expect(result.success).toBe(true);
//     });

//     it('should fail when channel does not exist', async () => {
//       const result = await service.sendChannelMessage(
//         mockSocket,
//         'nonexistent',
//         'test message'
//       );
//       expect(result.success).toBe(false);
//     });
//   });
// });