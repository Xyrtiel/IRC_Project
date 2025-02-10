import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { CommandHelpButton, CommandHelpOverlay } from './components/CommandHelpOverlay';
import './App.css';

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

// Création du socket avec quelques options de reconnexion
const socket: Socket = io('http://localhost:3001', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

function App() {
  const [channels, setChannels] = useState<string[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Connexion et gestion des erreurs / reconnexions
    socket.on('connect', () => {
      console.log('Connected to server with ID:', socket.id);
      setSocketConnected(true);
      setConnectionError(null);
    });

    socket.on('connect_error', (error: any) => {
      console.error('Connection error:', error);
      setSocketConnected(false);
      setConnectionError(`Connection error: ${error.message || error}`);
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt: ${attempt}`);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`Reconnected after ${attempt} attempt(s)`);
      setSocketConnected(true);
      setConnectionError(null);
    });

    socket.on('reconnect_error', (error: any) => {
      console.error('Reconnection error:', error);
      setConnectionError(`Reconnection error: ${error.message || error}`);
    });

    // Gestion des événements classiques
    socket.on('channelList', (channelList: string[]) => setChannels(channelList));
    socket.on('userList', (userList: string[]) => setUsers(userList));
    socket.on('message', (msg: Message) => setMessages(prev => [...prev, msg]));

    // Permet de fermer l'overlay d'aide en cliquant en dehors
    const handleClickOutside = () => setIsHelpOpen(false);
    document.addEventListener('click', handleClickOutside);

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('reconnect_attempt');
      socket.off('reconnect');
      socket.off('reconnect_error');
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
    if (!inputMessage.trim()) return;
    const [command, ...args] = inputMessage.trim().split(' ');

    switch (command.toLowerCase()) {
      case '/nick':
        if (args.length > 0) {
          handleSetNickname(args[0]);
        } else {
          alert('Usage: /nick <nickname>');
        }
        break;

      case '/list':
        socket.emit('listChannels', args[0] || '', (response: ServerResponse) => {
          if (response.success) {
            alert(`Available channels: ${response.message}`);
          } else {
            alert(`Error: ${response.message}`);
          }
        });
        break;

      case '/create':
        handleCreateChannel();
        break;

      case '/delete':
        if (args.length > 0) {
          socket.emit('deleteChannel', args[0], (response: ServerResponse) => {
            if (response.success) {
              alert(`Channel ${args[0]} deleted successfully`);
            } else {
              alert(`Failed to delete channel: ${response.message}`);
            }
          });
        } else {
          alert('Usage: /delete <channel>');
        }
        break;

      case '/join':
        if (args.length > 0) {
          handleJoinChannel(args[0]);
        } else {
          alert('Usage: /join <channel>');
        }
        break;

      case '/quit':
        if (currentChannel) {
          socket.emit('quitChannel', currentChannel, (response: ServerResponse) => {
            if (response.success) {
              setCurrentChannel(null);
              setMessages([]);
              alert(`Left channel: ${currentChannel}`);
            } else {
              alert(`Failed to quit channel: ${response.message}`);
            }
          });
        } else {
          alert('You are not in any channel');
        }
        break;

      case '/users':
        if (currentChannel) {
          socket.emit('listUsers', currentChannel, (response: ServerResponse) => {
            if (response.success) {
              alert(`Users in ${currentChannel}: ${response.message}`);
            } else {
              alert(`Failed to list users: ${response.message}`);
            }
          });
        } else {
          alert('You are not in any channel');
        }
        break;

      case '/msg':
        if (args.length >= 2) {
          const [recipient, ...messageWords] = args;
          const privateMessage = messageWords.join(' ');
          socket.emit('privateMessage', { recipient, message: privateMessage }, (response: ServerResponse) => {
            if (response.success) {
              alert(`Private message sent to ${recipient}`);
            } else {
              alert(`Failed to send private message: ${response.message}`);
            }
          });
        } else {
          alert('Usage: /msg <nickname> <message>');
        }
        break;

      default:
        if (currentChannel) {
          socket.emit('sendMessage', { channel: currentChannel, message: inputMessage }, (response: ServerResponse) => {
            if (!response.success) {
              alert(`Error sending message: ${response.message}`);
            }
          });
        } else {
          alert('Please join a channel first');
        }
    }
    setInputMessage('');
    setIsHelpOpen(false);
  };

  const handleCreateChannel = () => {
    const channelName = prompt('Enter channel name:');
    if (channelName) {
      socket.emit('createChannel', channelName, (response: ServerResponse) => {
        if (response.success) {
          alert(`Channel ${channelName} created successfully!`);
          setChannels(prev => [...prev, channelName]);
        } else {
          alert(`Failed to create channel: ${response.message}`);
        }
      });
    }
  };

  const handleJoinChannel = (channel: string) => {
    socket.emit('joinChannel', channel, (response: ServerResponse) => {
      if (response.success) {
        setCurrentChannel(channel);
        setMessages([]);
        alert(`Joined channel: ${channel}`);
      } else {
        alert(`Failed to join channel: ${response.message}`);
      }
    });
  };

  const handleSetNickname = (newNickname: string) => {
    socket.emit('setNickname', newNickname, (response: ServerResponse) => {
      if (response.success) {
        setNickname(newNickname);
        alert(`Nickname set to: ${newNickname}`);
      } else {
        alert(`Failed to set nickname: ${response.message}`);
      }
    });
  };

  return (
    <div className="irc-app">
      {connectionError && (
        <div className="connection-error">
          <span>{connectionError}</span>
          <button onClick={() => socket.connect()} className="retry-button">
            Reconnect
          </button>
        </div>
      )}
      
      <div className="sidebar">
        <h2>Channels</h2>
        <button className="create-channel-btn" onClick={handleCreateChannel}>
          Create Channel
        </button>
        <ul className="channel-list">
          {channels.map(channel => (
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
            <div className="connection-status">
              {socketConnected ? (
                <span className="status-connected">Connected</span>
              ) : (
                <span className="status-disconnected">Disconnected</span>
              )}
            </div>
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
          <form onSubmit={handleSendMessage} className="message-form relative" onClick={(e) => e.stopPropagation()}>
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
          <CommandHelpOverlay isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </div>
      </div>
    </div>
  );
}

export default App;
