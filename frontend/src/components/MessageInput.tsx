

import React, { useState, FormEvent } from 'react';

interface MessageInputProps {
  send: (message: string) => void;
  onSendMessage?: (message: string) => void;
}

export default function MessageInput({ send, onSendMessage }: MessageInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      send(input);
      onSendMessage?.(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-200">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 rounded border border-gray-300"
          placeholder="Type a message or command..."
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </form>
  );
}