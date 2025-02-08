import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { CommandHelpButton, CommandHelpOverlay } from './components/CommandHelpOverlay';
import './App.css';
import HomePage from './pages/HomePage';
import { BrowserRouter } from 'react-router-dom';

interface Message {
  sender: string;
  content: string;
  channel?: string;
  system?: boolean;
}

interface ServerResponse {
  success: boolean;
  message: string;
}

const socket: Socket = io('http://localhost:3000');

function App() {
  const [channels, setChannels] = useState<string[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    socket.on('connect', () => console.log('Connected to server'));
    socket.on('channelList', (channelList: string[]) => setChannels(channelList));
    socket.on('userList', (userList: string[]) => setUsers(userList));
    socket.on('message', (msg: Message) => setMessages(prev => [...prev, msg]));

    const handleClickOutside = () => setIsHelpOpen(false);
    document.addEventListener('click', handleClickOutside);

    return () => {
      socket.off('connect');
      socket.off('channelList');
      socket.off('userList');
      socket.off('message');
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const toggleHelp = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsHelpOpen(prev => !prev);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const [command, ...args] = inputMessage.split(' ');
      switch (command.toLowerCase()) {
        case '/nick':
          if (args.length > 0) {
            handleSetNickname(args[0]);
          } else {
            console.log('Usage: /nick <nickname>');
          }
          break;

        case '/list':
          socket.emit('listChannels', args[0] || '', (response: ServerResponse) => {
            console.log('Available channels:', response.message);
            alert(`Available channels: ${response.message}`);
          });
          break;

        case '/create':
          if (args.length > 0) {
            handleCreateChannel();
          } else {
            console.log('Usage: /create <channel>');
          }
          break;

        case '/delete':
          if (args.length > 0) {
            socket.emit('deleteChannel', args[0], (response: ServerResponse) => {
              if (response.success) {
                console.log(`Channel ${args[0]} deleted successfully`);
                alert(`Channel ${args[0]} deleted successfully`);
              } else {
                console.error(`Failed to delete channel: ${response.message}`);
                alert(`Failed to delete channel: ${response.message}`);
              }
            });
          } else {
            console.log('Usage: /delete <channel>');
          }
          break;

        case '/join':
          if (args.length > 0) {
            handleJoinChannel(args[0]);
          } else {
            console.log('Usage: /join <channel>');
          }
          break;

        case '/quit':
          if (currentChannel) {
            socket.emit('quitChannel', currentChannel, (response: ServerResponse) => {
              if (response.success) {
                setCurrentChannel(null);
                setMessages([]);
                console.log(`Quit channel: ${currentChannel}`);
                alert(`Left channel: ${currentChannel}`);
              } else {
                console.error(`Failed to quit channel: ${response.message}`);
                alert(`Failed to quit channel: ${response.message}`);
              }
            });
          } else {
            console.log('You are not in any channel');
            alert('You are not in any channel');
          }
          break;

        case '/users':
          if (currentChannel) {
            socket.emit('listUsers', currentChannel, (response: ServerResponse) => {
              if (response.success) {
                console.log(`Users in ${currentChannel}:`, response.message);
                alert(`Users in ${currentChannel}: ${response.message}`);
              } else {
                console.error(`Failed to list users: ${response.message}`);
                alert(`Failed to list users: ${response.message}`);
              }
            });
          } else {
            console.log('You are not in any channel');
            alert('You are not in any channel');
          }
          break;

        case '/msg':
          if (args.length >= 2) {
            const [recipient, ...messageWords] = args;
            const privateMessage = messageWords.join(' ');
            socket.emit('privateMessage', { recipient, message: privateMessage }, (response: ServerResponse) => {
              if (response.success) {
                console.log(`Private message sent to ${recipient}`);
                alert(`Private message sent to ${recipient}`);
              } else {
                console.error(`Failed to send private message: ${response.message}`);
                alert(`Failed to send private message: ${response.message}`);
              }
            });
          } else {
            console.log('Usage: /msg <nickname> <message>');
          }
          break;

        default:
          if (currentChannel) {
            socket.emit('sendMessage', { channel: currentChannel, message: inputMessage });
          } else {
            console.log('Cannot send message: No channel selected');
            alert('Please join a channel first');
          }
      }
      setInputMessage('');
      setIsHelpOpen(false);
    }
  };

  const handleCreateChannel = () => {
    const channelName = prompt('Enter channel name:');
    if (channelName) {
      socket.emit('createChannel', channelName, (response: ServerResponse) => {
        if (response.success) {
          alert(`Channel ${channelName} created successfully!`);
          setChannels(prevChannels => [...prevChannels, channelName]);
        } else {
          alert(`Failed to create channel: ${response.message}`);
        }
      });
    }
  };

  const handleJoinChannel = (channel: string) => {
    console.log(`Attempting to join channel: ${channel}`);
    socket.emit('joinChannel', channel, (response: ServerResponse) => {
      console.log('Received response:', response);
      if (response.success) {
        setCurrentChannel(channel);
        setMessages([]);
        console.log(`Joined channel: ${channel}`);
      } else {
        console.error(`Failed to join channel: ${response.message}`);
        alert(`Failed to join channel: ${response.message}`);
      }
    });
  };

  const handleSetNickname = (newNickname: string) => {
    console.log('Attempting to set nickname:', newNickname);
    socket.emit('setNickname', newNickname, (response: ServerResponse) => {
      console.log('Received response for setNickname:', response);
      if (response.success) {
        setNickname(newNickname);
        console.log('Nickname set successfully to:', newNickname);
        alert(`Nickname set to: ${newNickname}`);
      } else {
        console.error('Failed to set nickname:', response.message);
        alert(`Failed to set nickname: ${response.message}`);
      }
    });
  };

  return (
    <BrowserRouter>
      <div className="irc-app">
        <HomePage />
        <div className="sidebar">
          <h2>Channels</h2>
          <button className="create-channel-btn" onClick={handleCreateChannel}>
            Create Channel
          </button>
          <ul className="channel-list">
            {channels.map((channel) => (
              <li key={channel} onClick={() => handleJoinChannel(channel)}>
                #{channel}
              </li>
            ))}
          </ul>
        </div>
        <div className="main-content">
          <div className="header">
            <div className="flex justify-between items-center">
              <h1>{currentChannel ? `#${currentChannel}` : 'Welcome to IRC'}</h1>
              <div className="flex items-center space-x-2">
                <span>Nickname: {nickname || 'Not set'}</span>
                <button 
                  className="set-nickname-btn" 
                  onClick={() => {
                    const newNickname = prompt('Enter your nickname:');
                    if (newNickname) handleSetNickname(newNickname);
                  }}
                >
                  Set Nickname
                </button>
              </div>
            </div>
          </div>
          <div className="message-area">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.system ? 'system' : ''}`}>
                {msg.system ? (
                  <span className="system-message">{msg.content}</span>
                ) : (
                  <>
                    <span className="sender">{msg.sender}: </span>
                    <span className="content">{msg.content}</span>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="relative">
            <form 
              onSubmit={handleSendMessage} 
              className="message-form relative"
              onClick={(e) => e.stopPropagation()}
            >
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message or command..."
                className="w-full pr-16" 
              />
              <div className="absolute right-0 top-0 flex items-center h-full">
                <CommandHelpButton 
                  onToggle={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleHelp(e);
                  }} 
                  isOpen={isHelpOpen} 
                />
                <button type="submit" className="ml-2 bg-blue-500 text-white px-3 py-1 rounded">
                  Send
                </button>
              </div>
            </form>
            <CommandHelpOverlay 
              isOpen={isHelpOpen} 
              onClose={() => setIsHelpOpen(false)} 
            />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;