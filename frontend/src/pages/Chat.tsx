import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import './Chat.css';

interface Message {
  sender: string;
  content: string;
  channel?: string;
  system?: boolean;
}

interface Channel {
  name: string;
  members: string[];
}

// Extension de l'interface Socket pour y ajouter une propriété "data"
interface CustomSocket extends Socket {
  data: {
    username: string;
  };
}

const Chat: React.FC = () => {
  // Utilisation de CustomSocket à la place de Socket
  const socketRef = useRef<CustomSocket | null>(null);
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [newChannel, setNewChannel] = useState('');
  const [recipient, setRecipient] = useState<string>('');
  const [isPrivateChat, setIsPrivateChat] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [nickname, setNickname] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Envoi de message (privé ou dans un canal)
  const sendMessage = (content: string) => {
    if (!content.trim()) {
      setError('Message cannot be empty');
      return;
    }

    if (isPrivateChat && recipient) {
      socketRef.current?.emit('private message', { content, recipient });
    } else if (selectedChannel) {
      socketRef.current?.emit('chat message', { content, channelName: selectedChannel });
    } else {
      setError('Please select a channel or recipient');
    }
  };

  // Création d'un canal
  const createChannel = () => {
    if (!newChannel.trim()) {
      setError('Channel name cannot be empty');
      return;
    }
    socketRef.current?.emit('createChannel', newChannel);
    setNewChannel('');
  };

  // Effet de connexion et gestion des événements socket
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Cast en CustomSocket pour pouvoir utiliser la propriété "data"
    const socket = io('http://localhost:3000', {
      auth: { token },
      withCredentials: true,
    }) as CustomSocket;

    // Initialisation de socket.data (ici on utilise le nickname stocké dans l'état, qui pourra être mis à jour)
    socket.data = { username: nickname };

    socketRef.current = socket;

    // Connexion et gestion des erreurs
    socket.on('connect', () => {
      console.log('Connected to chat server');
      setError('');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Failed to connect to server');
      navigate('/');
    });

    // Réception de la liste des canaux
    socket.on('channel list', (channelList: Channel[]) => {
      setChannels(channelList);
    });

    socket.on('channel created', (newChannel: Channel) => {
      setChannels((prevChannels) => [...prevChannels, newChannel]);
    });

    // Réception d'un message dans un canal
    socket.on('chat message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Réception d'un message privé
    socket.on('private message', (message: Message) => {
      if (
        isPrivateChat &&
        (message.sender === recipient || message.sender === socket.data?.username)
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    // Mise à jour de la liste des utilisateurs en ligne
    socket.on('users online', (onlineUsers: string[]) => {
      setUsers(onlineUsers);
    });

    return () => {
      socket.close();
    };
  }, [navigate, isPrivateChat, recipient, nickname]);

  // Sélection d'un canal
  const handleChannelSelect = (channelName: string) => {
    socketRef.current?.emit('joinChannel', channelName);
    setSelectedChannel(channelName);
    setIsPrivateChat(false);
    setRecipient('');
  };

  // Gestion de la conversation privée
  const handlePrivateChat = (username: string) => {
    setIsPrivateChat(true);
    setRecipient(username);
    setSelectedChannel(null);
    socketRef.current?.emit('fetchPrivateMessages', username);
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    socketRef.current?.close();
    navigate('/');
  };

  // Fonction pour définir le nickname et le mettre à jour dans socket.data
  const handleSetNickname = (newNickname: string) => {
    setNickname(newNickname);
    if (socketRef.current) {
      socketRef.current.data.username = newNickname;
      socketRef.current.emit('setNickname', newNickname);
    }
  };

  return (
    <div className="chat-app">
      <div className="sidebar">
        <div className="user-info">
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
        <h2>Channels</h2>
        <div>
          {channels.map((channel) => (
            <button
              key={channel.name}
              className={`channel-button ${selectedChannel === channel.name ? 'selected' : ''}`}
              onClick={() => handleChannelSelect(channel.name)}
            >
              # {channel.name}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={newChannel}
          onChange={(e) => setNewChannel(e.target.value)}
          placeholder="Create a new channel"
          className="create-channel-input"
        />
        <button className="create-channel-btn" onClick={createChannel}>
          Create
        </button>

        <h3>Users</h3>
        <div>
          {users.map((user) => (
            <button key={user} className="user-button" onClick={() => handlePrivateChat(user)}>
              {user}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-main">
        <header className="chat-header">
          <h2>
            {isPrivateChat
              ? `Private Chat with ${recipient}`
              : selectedChannel
              ? `#${selectedChannel}`
              : 'Select a channel or user'}
          </h2>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <div className="messages-area">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.system ? 'system-message' : ''}`}>
              <span className="sender">{msg.sender}: </span>
              <span className="content">{msg.content}</span>
            </div>
          ))}
        </div>

        <div className="message-input">
          <input
            type="text"
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default Chat;
