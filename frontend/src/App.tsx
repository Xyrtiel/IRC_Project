import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { CommandHelpButton, CommandHelpOverlay } from './components/CommandHelpOverlay';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
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

// Mise à jour de l'interface AuthResponse pour refléter le retour de l'API (utilisation de "pseudo")
interface AuthResponse {
  token: string;
  user: {
    id: string;
    pseudo: string;
  };
}

// Création du socket avec authentification
const createSocket = (token: string): Socket => {
  return io('http://localhost:3000', {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: { token }
  });
};

function IRCChat() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [channels, setChannels] = useState<string[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  // On récupère le pseudo stocké sous la clé "nickname" dans le localStorage
  const [nickname, setNickname] = useState(localStorage.getItem('nickname') || '');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    
    const newSocket = createSocket(token);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected with ID:', newSocket.id);
      setSocketConnected(true);
      setConnectionError(null);
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
      setConnectionError(`Erreur de connexion: ${error.message || error}`);
    });

    newSocket.on('reconnect_attempt', (attempt) => {
      console.log(`Tentative de reconnexion: ${attempt}`);
    });

    newSocket.on('reconnect', (attempt) => {
      console.log(`Reconnexion réussie après ${attempt} tentative(s)`);
      setSocketConnected(true);
      setConnectionError(null);
    });

    newSocket.on('reconnect_error', (error: any) => {
      console.error('Erreur de reconnexion:', error);
      setConnectionError(`Erreur de reconnexion: ${error.message || error}`);
    });

    newSocket.on('channelList', (channelList: string[]) => {
      console.log('Received channel list:', channelList);
      setChannels(channelList);
    });

    newSocket.on('userList', (userList: string[]) => {
      console.log('Received user list:', userList);
      setUsers(userList);
    });

    newSocket.on('message', (msg: Message) => {
      console.log('Received message:', msg);
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setSocketConnected(false);
      if (reason === 'io server disconnect') {
        navigate('/');
      }
    });

    // Nettoyage lors du démontage du composant
    return () => {
      newSocket.close();
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    socket?.close();
    navigate('/');
  };

  const toggleHelp = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsHelpOpen(prev => !prev);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !socket.connected) {
      alert('Non connecté au serveur');
      return;
    }
    if (inputMessage.trim()) {
      const [command, ...args] = inputMessage.trim().split(' ');
      
      switch (command.toLowerCase()) {
        case '/nick':
          if (args.length > 0) {
            handleSetNickname(args[0]);
          } else {
            alert('Usage: /nick <pseudo>');
          }
          break;
        case '/list':
          socket.emit('listChannels', args[0] || '', (response: ServerResponse) => {
            if (response.success) {
              alert(`Canaux disponibles: ${response.message}`);
            } else {
              alert(`Erreur: ${response.message}`);
            }
          });
          break;
        case '/join':
          if (args.length > 0) {
            handleJoinChannel(args[0]);
          } else {
            alert('Usage: /join <canal>');
          }
          break;
        case '/quit':
          if (currentChannel) {
            handleQuitChannel(currentChannel);
          } else {
            alert('Vous n\'êtes dans aucun canal');
          }
          break;
        case '/msg':
          if (args.length >= 2) {
            const [recipient, ...messageWords] = args;
            handlePrivateMessage(recipient, messageWords.join(' '));
          } else {
            alert('Usage: /msg <pseudo> <message>');
          }
          break;
        default:
          if (currentChannel) {
            socket.emit('sendMessage', { 
              channel: currentChannel, 
              message: inputMessage 
            }, (response: ServerResponse) => {
              if (!response.success) {
                alert(`Erreur d'envoi: ${response.message}`);
              }
            });
          } else {
            alert('Veuillez d\'abord rejoindre un canal');
          }
      }
      setInputMessage('');
      setIsHelpOpen(false);
    }
  };

  const handleCreateChannel = () => {
    if (!socket || !socket.connected) return;
    const channelName = prompt('Nom du canal:');
    if (channelName) {
      socket.emit('createChannel', channelName, (response: ServerResponse) => {
        if (response.success) {
          alert(`Canal ${channelName} créé avec succès!`);
          setChannels(prevChannels => [...prevChannels, channelName]);
        } else {
          alert(`Échec de création du canal: ${response.message}`);
        }
      });
    }
  };

  const handleJoinChannel = (channel: string) => {
    if (!socket || !socket.connected) return;
    socket.emit('joinChannel', channel, (response: ServerResponse) => {
      if (response.success) {
        setCurrentChannel(channel);
        setMessages([]);
      } else {
        alert(`Impossible de rejoindre le canal: ${response.message}`);
      }
    });
  };

  const handleQuitChannel = (channel: string) => {
    if (!socket || !socket.connected) return;
    socket.emit('quitChannel', channel, (response: ServerResponse) => {
      if (response.success) {
        setCurrentChannel(null);
        setMessages([]);
        alert(`Canal quitté: ${channel}`);
      } else {
        alert(`Impossible de quitter le canal: ${response.message}`);
      }
    });
  };

  const handlePrivateMessage = (recipient: string, message: string) => {
    if (!socket || !socket.connected) return;
    socket.emit('privateMessage', { recipient, message }, (response: ServerResponse) => {
      if (response.success) {
        alert(`Message privé envoyé à ${recipient}`);
      } else {
        alert(`Échec d'envoi du message privé: ${response.message}`);
      }
    });
  };

  const handleSetNickname = (newNickname: string) => {
    if (!socket || !socket.connected) {
      alert('Non connecté au serveur');
      return;
    }
    socket.emit('setNickname', newNickname, (response: ServerResponse) => {
      if (response.success) {
        setNickname(newNickname);
        localStorage.setItem('nickname', newNickname);
        alert(`Pseudo défini: ${newNickname}`);
      } else {
        alert(`Échec de définition du pseudo: ${response.message}`);
        if (localStorage.getItem('nickname') === newNickname) {
          localStorage.removeItem('nickname');
        }
      }
    });
  };

  return (
    <div className="irc-app">
      {connectionError && (
        <div className="connection-error">
          <span>{connectionError}</span>
          <button onClick={() => socket?.connect()} className="retry-button">
            Reconnecter
          </button>
        </div>
      )}
      
      <div className="sidebar">
        <h2>Canaux</h2>
        <button className="create-channel-btn" onClick={handleCreateChannel}>
          Créer un Canal
        </button>
        <ul className="channel-list">
          {channels.map(channel => (
            <li 
              key={channel}
              onClick={() => handleJoinChannel(channel)}
              className={currentChannel === channel ? 'active' : ''}
            >
              #{channel}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="main-content">
        <div className="header">
          <div className="flex justify-between items-center">
            <h1>{currentChannel ? `#${currentChannel}` : 'Bienvenue sur IRC'}</h1>
            <div className="connection-status">
              {socketConnected ? (
                <span className="status-connected">Connecté</span>
              ) : (
                <span className="status-disconnected">Déconnecté</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span>Connecté en tant que: {nickname}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Déconnexion
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
            onClick={e => e.stopPropagation()}
          >
            <input 
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Tapez un message ou une commande..."
              className="w-full pr-16"
              disabled={!socketConnected}
            />
            <div className="absolute right-0 top-0 flex items-center h-full">
              <CommandHelpButton 
                onToggle={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleHelp(e);
                }}
                isOpen={isHelpOpen}
              />
              <button 
                type="submit"
                className="ml-2 bg-blue-500 text-white px-3 py-1 rounded"
                disabled={!socketConnected}
              >
                Envoyer
              </button>
            </div>
          </form>
          <CommandHelpOverlay isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={localStorage.getItem('token') ? <IRCChat /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
