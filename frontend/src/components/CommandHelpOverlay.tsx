import React from 'react';

interface CommandHelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandHelpButtonProps {
  onToggle: () => void;
  isOpen: boolean;
}

const CommandHelpOverlay: React.FC<CommandHelpOverlayProps> = ({ isOpen, onClose }) => {
  const commands = [
    { command: '/nick', description: 'Définir ou changer votre pseudo ', usage: '/nick <nouveau_pseudo>' },
    { command: '/list', description: 'Lister les canaux disponibles ', usage: '/list [filtre optionnel]' },
    { command: '/create', description: 'Créer un nouveau canal ', usage: '/create <nom_du_canal>' },
    { command: '/join', description: 'Rejoindre un canal existant ', usage: '/join <nom_du_canal>' },
    { command: '/delete', description: 'Supprimer un canal que vous avez créé ', usage: '/delete <nom_du_canal>' },
    { command: '/quit', description: 'Quitter le canal actuel', usage: '/quit' },
    { command: '/users', description: 'Lister les utilisateurs du canal actuel ', usage: '/users' },
    { command: '/msg', description: 'Envoyer un message privé à un utilisateur ', usage: '/msg <pseudo> <message>' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[600px] max-h-[80vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
          Commandes Disponibles
        </h2>
        <div className="space-y-4">
          {commands.map((cmd, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <div className="font-semibold text-blue-600 text-lg">{cmd.command}</div>
              <div className="text-gray-600 text-sm whitespace-pre-line">{cmd.description}</div>
              <div className="text-gray-500 text-xs mt-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  Utilisation : {cmd.usage}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CommandHelpButton: React.FC<CommandHelpButtonProps> = ({ onToggle, isOpen }) => {
  return (
    <button
      onClick={() => onToggle()}
      type="button"
      className={`ml-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 focus:outline-none transition-colors ${
        isOpen ? 'bg-gray-300' : ''
      }`}
      aria-label="Afficher les commandes"
    >
      Help
    </button>
  );
};

export { CommandHelpButton, CommandHelpOverlay };