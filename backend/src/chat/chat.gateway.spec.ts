// import { Test, TestingModule } from '@nestjs/testing';
// import { getModelToken } from '@nestjs/mongoose';
// import { ChatGateway } from './chat.gateway';
// import { ChatService } from './chat.service';
// import { Channel } from './schemas/channel.schema';
// import { Message } from './schemas/message.schema';
// import { User } from './schemas/user.schema';
// import { Socket, Server } from 'socket.io';

// describe('ChatGateway', () => {
//   let gateway: ChatGateway;
//   let mockChatService: Partial<ChatService>;
//   let mockServer: any;
//   let mockClient: any;

//   // Mock model creator
//   const createMockModel = (data: any[] = []) => ({
//     find: jest.fn().mockReturnThis(),
//     findOne: jest.fn().mockReturnThis(),
//     where: jest.fn().mockReturnThis(),
//     exec: jest.fn().mockResolvedValue(data),
//     save: jest.fn().mockResolvedValue({}),
//     deleteOne: jest.fn().mockResolvedValue({}),
//     create: jest.fn().mockResolvedValue({}),
//   });

//   const mockUserModel = createMockModel();
//   const mockChannelModel = createMockModel();
//   const mockMessageModel = createMockModel();

//   beforeEach(async () => {
//     // Create mock service with minimal implementations
//     mockChatService = {
//       createChannel: jest.fn().mockResolvedValue({ success: true, message: 'Channel created' }),
//       deleteChannel: jest.fn().mockResolvedValue({ success: true, message: 'Channel deleted' }),
//       listChannels: jest.fn().mockResolvedValue({ success: true, message: 'channel1,channel2' }),
//       sendPrivateMessage: jest.fn().mockResolvedValue({ success: true, message: 'Private message sent' }),
//     };

//     // Create mock server and client
//     mockServer = {
//       emit: jest.fn(),
//       to: jest.fn().mockReturnThis(),
//       in: jest.fn().mockReturnThis(),
//       sockets: {
//         get: jest.fn(),
//       },
//     };

//     mockClient = {
//       id: 'test-client-id',
//       join: jest.fn(),
//       leave: jest.fn(),
//       to: jest.fn(() => ({
//         emit: jest.fn(),
//       })),
//       data: {},
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         {
//           provide: getModelToken(User.name),
//           useValue: mockUserModel,
//         },
//         {
//           provide: getModelToken(Channel.name),
//           useValue: mockChannelModel,
//         },
//         {
//           provide: getModelToken(Message.name),
//           useValue: mockMessageModel,
//         },
//         {
//           provide: ChatService,
//           useValue: mockChatService,
//         },
//         ChatGateway,
//       ],
//     }).compile();

//     gateway = module.get<ChatGateway>(ChatGateway);
//     gateway.server = mockServer;
//   });

//   describe('handleMessage', () => {
//     it('should handle message in channel', async () => {
//       const messageData = {
//         channel: 'test-channel',
//         message: 'test message',
//       };

//       const result = await gateway.handleMessage(messageData, mockClient);
//       expect(result.success).toBe(true);
//     });
//   });

//   describe('handleSetNickname', () => {
//     it('should set nickname for new user', async () => {
//       mockUserModel.findOne.mockResolvedValue(null);
      
//       const result = await gateway.handleSetNickname('testUser', mockClient);
//       expect(result.success).toBe(true);
//       expect(result.message).toContain('testUser');
//     });

//     it('should reject duplicate nickname', async () => {
//       mockUserModel.findOne
//         .mockResolvedValueOnce(null)
//         .mockResolvedValueOnce({ nickname: 'testUser' });
      
//       await gateway.handleSetNickname('testUser', mockClient);
//       const result = await gateway.handleSetNickname('testUser', {
//         ...mockClient,
//         id: 'other-client',
//       });
//       expect(result.success).toBe(false);
//     });
//   });

//   describe('handleJoinChannel', () => {
//     const channelName = 'test-channel';

//     it('should join channel successfully', async () => {
//       mockChannelModel.findOne.mockResolvedValue({ name: channelName });
      
//       const result = await gateway.handleJoinChannel(channelName, mockClient);
//       expect(result.success).toBe(true);
//       expect(mockClient.join).toHaveBeenCalledWith(channelName);
//     });
//   });

//   describe('handlePrivateMessage', () => {
//     beforeEach(() => {
//       // Prepare the gateway's internal users map
//       (gateway as any).users = new Map([
//         ['sender', { socketId: mockClient.id, nickname: 'sender' }],
//         ['recipient', { socketId: 'recipient-id', nickname: 'recipient' }]
//       ]);
      
//       mockServer.sockets.get.mockImplementation((socketId) => 
//         socketId === 'recipient-id' ? { 
//           emit: jest.fn() 
//         } : undefined
//       );
//     });

//     it('should send private message to existing user', async () => {
//       const messageData = {
//         recipient: 'recipient',
//         message: 'test private message',
//       };

//       const result = await gateway.handlePrivateMessage(messageData, mockClient);
//       expect(result.success).toBe(false);
//     });

//     it('should fail when sender has no nickname', async () => {
//       const messageData = {
//         recipient: 'recipient',
//         message: 'test message',
//       };

//       const newClient = { ...mockClient, id: 'new-client' };
//       const result = await gateway.handlePrivateMessage(messageData, newClient);
//       expect(result.success).toBe(false);
//     });
//   });

//   describe('handleCreateChannel', () => {
//     it('should create new channel', async () => {
//       const result = await gateway.handleCreateChannel('new_channel21');
//       expect(result.success).toBe(true);
//       expect(mockServer.emit).toHaveBeenCalledWith('updateChannelList');
//     });
//   });

//   describe('handleDeleteChannel', () => {
//     it('should delete existing channel', async () => {
//       const result = await gateway.handleDeleteChannel('channel');
//       expect(result.success).toBe(true);
//       expect(mockServer.emit).toHaveBeenCalledWith('updateChannelList');
//     });
//   });

//   describe('handleListChannels', () => {
//     it('should list all channels when no filter is provided', async () => {
//       const result = await gateway.handleListChannels();
//       expect(result.success).toBe(true);
//       expect(result.message).toContain('channel1');
//       expect(result.message).toContain('channel2');
//     });

//     it('should filter channels based on provided filter', async () => {
//       const result = await gateway.handleListChannels('channel1');
//       expect(result.success).toBe(true);
//       expect(result.message).toContain('channel1');
//     });

//     it('should return empty message when no matching channels', async () => {
//       mockChatService.listChannels = jest.fn().mockResolvedValue({ success: true, message: '' });
//       const result = await gateway.handleListChannels('nonexistent');
//       expect(result.success).toBe(true);
//       expect(result.message).toBe('');
//     });
//   });
// });