import React from 'react';
import { HelpCircle } from 'lucide-react';

// Define interfaces for prop types
interface CommandHelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandHelpButtonProps {
  onToggle: (e: React.MouseEvent) => void;
  isOpen: boolean;
}

const CommandHelpOverlay: React.FC<CommandHelpOverlayProps> = ({ isOpen, onClose }) => {
  const commands = [
    { 
      command: '/nick', 
      description: 'Définir ou changer votre pseudo\n',
      usage: '/nick <nouveau_pseudo>'
    },
    { 
      command: '/list', 
      description: 'Lister les canaux disponibles\n',
      usage: '/list [filtre optionnel]'
    },
    { 
      command: '/create', 
      description: 'Créer un nouveau canal\n',
      usage: '/create <nom_du_canal>'
    },
    { 
      command: '/join', 
      description: 'Rejoindre un canal existant\n',
      usage: '/join <nom_du_canal>'
    },
    { 
      command: '/delete', 
      description: 'Supprimer un canal que vous avez créé\n',
      usage: '/delete <nom_du_canal>'
    },
    { 
      command: '/quit', 
      description: 'Quitter le canal actuel\n',
      usage: '/quit'
    },
    { 
      command: '/users', 
      description: 'Lister les utilisateurs du canal actuel\n',
      usage: '/users'
    },
    { 
      command: '/msg', 
      description: 'Envoyer un message privé à un utilisateur\n',
      usage: '/msg <pseudo> <message>'
    }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="absolute bottom-full left-0 w-full mb-2 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white border rounded-lg shadow-lg p-4 max-h-[300px] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 underline">
          Commandes Disponibles
        </h2>
        <div className="space-y-3">
          {commands.map((cmd, index) => (
            <div key={index} className="border-b pb-2 last:border-b-0">
              <div className="font-semibold text-blue-600">{cmd.command}</div>
              <div className="text-gray-600 text-sm whitespace-pre-line">{cmd.description}</div>
              <div className="text-gray-500 text-xs mt-1">
                <span className="font-mono bg-gray-100 px-1 rounded">
                  Utilisation : {cmd.usage}
                </span>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={onClose}
          className="mt-3 w-full bg-gray-200 hover:bg-gray-300 py-1 rounded text-sm"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

const CommandHelpButton: React.FC<CommandHelpButtonProps> = ({ onToggle, isOpen }) => {
  return (
    <button 
      onClick={onToggle}
      type="button"
      className={`ml-2 text-gray-600 hover:text-gray-900 focus:outline-none ${isOpen ? 'text-blue-500' : ''}`}
      aria-label="Afficher les commandes"
    >
      <HelpCircle size={24} />
    </button>
  );
};

export { CommandHelpButton, CommandHelpOverlay };