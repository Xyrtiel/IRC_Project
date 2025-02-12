// import { render, fireEvent, screen, act, waitFor } from '@testing-library/react';
// import { io } from 'socket.io-client';
// import { Socket } from 'socket.io-client';
// import React from 'react';
// import App from './App';

// jest.mock('socket.io-client');

// interface SocketMock {
//   on: jest.Mock;
//   emit: jest.Mock;
//   off: jest.Mock;
//   connect: jest.Mock;
// }

// describe('App', () => {
//   let mockSocket: SocketMock;

//   beforeEach(() => {
//     mockSocket = {
//       on: jest.fn(),
//       emit: jest.fn(),
//       off: jest.fn(),
//       connect: jest.fn(),
//     };
//     (io as jest.Mock).mockReturnValue(mockSocket);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   const toggleHelp = (e: React.MouseEvent<HTMLElement>) => {
//     e.stopPropagation();
//     // Logique du toggle
//   };

//   it('should render without crashing', () => {
//     render(<App />);
//     expect(screen.getByText('Welcome to IRC')).toBeInTheDocument();
//   });

//   it('should handle nickname setting', async () => {
//     mockSocket.emit.mockImplementation((event, nickname, callback) => {
//       if (event === 'setNickname') {
//         callback({ success: true, message: `Nickname set to ${nickname}` });
//       }
//     });

//     render(<App />);
    
//     const setNicknameButton = screen.getByText('Set Nickname');
//     fireEvent.click(setNicknameButton);

//     const nicknameInput = screen.getByRole('textbox');
//     fireEvent.change(nicknameInput, { target: { value: 'testUser' } });
//     fireEvent.keyPress(nicknameInput, { key: 'Enter', code: 13, charCode: 13 });

//     await waitFor(() => {
//       expect(screen.getByText('Nickname: testUser')).toBeInTheDocument();
//     });
//   });

//   it('should handle channel creation', async () => {
//     mockSocket.emit.mockImplementation((event, channelName, callback) => {
//       if (event === 'createChannel') {
//         callback({ success: true, message: `Channel ${channelName} created` });
//       }
//     });

//     render(<App />);
    
//     const createChannelButton = screen.getByText('Create Channel');
//     fireEvent.click(createChannelButton);

//     const channelInput = screen.getByRole('textbox');
//     fireEvent.change(channelInput, { target: { value: 'test-channel' } });
//     fireEvent.keyPress(channelInput, { key: 'Enter', code: 13, charCode: 13 });

//     await waitFor(() => {
//       expect(mockSocket.emit).toHaveBeenCalledWith(
//         'createChannel',
//         'test-channel',
//         expect.any(Function)
//       );
//     });
//   });

//   it('should handle message sending', async () => {
//     render(<App />);
    
//     // Set current channel
//     act(() => {
//       (mockSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'message')[1]({
//         channel: 'test-channel',
//         sender: 'System',
//         content: 'Channel joined'
//       });
//     });

//     const messageInput = screen.getByPlaceholderText('Type a message or command...');
//     fireEvent.change(messageInput, { target: { value: 'Hello, World!' } });
//     fireEvent.submit(messageInput.closest('form')!);

//     expect(mockSocket.emit).toHaveBeenCalledWith(
//       'sendMessage',
//       expect.objectContaining({
//         message: 'Hello, World!'
//       }),
//       expect.any(Function)
//     );
//   });

//   it('should handle command help overlay', () => {
//     render(<App />);
    
//     const helpButton = screen.getByLabelText('Afficher les commandes');
//     fireEvent.click(helpButton);

//     expect(screen.getByText('Commandes Disponibles')).toBeInTheDocument();
    
//     // Close overlay
//     fireEvent.click(screen.getByRole('button', { name: /fermer/i }));
//     expect(screen.queryByText('Commandes Disponibles')).not.toBeInTheDocument();
//   });

//   it('should handle IRC commands', async () => {
//     render(<App />);
    
//     const messageInput = screen.getByPlaceholderText('Type a message or command...');

//     // Test /join command
//     fireEvent.change(messageInput, { target: { value: '/join test-channel' } });
//     fireEvent.submit(messageInput.closest('form')!);

//     expect(mockSocket.emit).toHaveBeenCalledWith(
//       'joinChannel',
//       'test-channel',
//       expect.any(Function)
//     );

//     // Test /nick command
//     fireEvent.change(messageInput, { target: { value: '/nick testUser' } });
//     fireEvent.submit(messageInput.closest('form')!);

//     expect(mockSocket.emit).toHaveBeenCalledWith(
//       'setNickname',
//       'testUser',
//       expect.any(Function)
//     );

//     // Test /list command
//     fireEvent.change(messageInput, { target: { value: '/list' } });
//     fireEvent.submit(messageInput.closest('form')!);

//     expect(mockSocket.emit).toHaveBeenCalledWith(
//       'listChannels',
//       '',
//       expect.any(Function)
//     );

//     // Test /msg command
//     fireEvent.change(messageInput, { target: { value: '/msg user1 Hello!' } });
//     fireEvent.submit(messageInput.closest('form')!);

//     expect(mockSocket.emit).toHaveBeenCalledWith(
//       'privateMessage',
//       {
//         recipient: 'user1',
//         message: 'Hello!'
//       },
//       expect.any(Function)
//     );
//   });

//   it('should handle socket events', async () => {
//     render(<App />);

//     // Simulate receiving a message
//     act(() => {
//       const messageHandler = (mockSocket.on as jest.Mock).mock.calls
//         .find(call => call[0] === 'message')[1];
      
//       messageHandler({
//         sender: 'user1',
//         content: 'Hello, World!',
//         channel: 'test-channel'
//       });
//     });

//     await waitFor(() => {
//       expect(screen.getByText('user1:')).toBeInTheDocument();
//       expect(screen.getByText('Hello, World!')).toBeInTheDocument();
//     });

//     // Simulate receiving a private message
//     act(() => {
//       const privateMessageHandler = (mockSocket.on as jest.Mock).mock.calls
//         .find(call => call[0] === 'privateMessage')[1];
      
//       privateMessageHandler({
//         sender: 'user2',
//         content: 'Private message'
//       });
//     });

//     await waitFor(() => {
//       expect(screen.getByText('user2:')).toBeInTheDocument();
//       expect(screen.getByText('Private message')).toBeInTheDocument();
//     });

//     // Simulate channel list update
//     act(() => {
//       const updateHandler = (mockSocket.on as jest.Mock).mock.calls
//         .find(call => call[0] === 'updateChannelList')[1];
      
//       updateHandler();
//     });

//     expect(mockSocket.emit).toHaveBeenCalledWith(
//       'listChannels',
//       '',
//       expect.any(Function)
//     );
//   });

//   it('should handle error cases', async () => {
//     const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
//     render(<App />);
    
//     // Simulate connection error
//     act(() => {
//       const errorHandler = (mockSocket.on as jest.Mock).mock.calls
//         .find(call => call[0] === 'connect_error')[1];
      
//       errorHandler(new Error('Connection failed'));
//     });

//     expect(consoleError).toHaveBeenCalledWith(
//       'Connection error:',
//       expect.any(Error)
//     );

//     // Simulate failed message sending
//     const messageInput = screen.getByPlaceholderText('Type a message or command...');
//     mockSocket.emit.mockImplementation((event, data, callback) => {
//       if (event === 'sendMessage') {
//         callback({ success: false, message: 'Failed to send message' });
//       }
//     });

//     fireEvent.change(messageInput, { target: { value: 'Test message' } });
//     fireEvent.submit(messageInput.closest('form')!);

//     expect(consoleError).toHaveBeenCalledWith(
//       'Failed to send message:',
//       'Failed to send message'
//     );

//     consoleError.mockRestore();
//   });
// });