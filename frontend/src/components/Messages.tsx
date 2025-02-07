import React from 'react';

interface Message {
  type?: 'system' | 'error';
  sender: string;
  content: string;
  timestamp: string;
  channel?: string;
}

interface MessagesProps {
  messages: Message[];
}

export default function Messages({ messages }: MessagesProps) {
  return (
    <div className="flex-grow overflow-y-auto p-4">
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`mb-2 ${
            message.type === 'system' 
              ? 'text-gray-500' 
              : message.type === 'error' 
                ? 'text-red-500' 
                : ''
          }`}
        >
          <div className="message-header">
            <strong>{message.sender}</strong>
            <span className="ml-2 text-sm text-gray-500">
              {new Date(message.timestamp).toLocaleString()}
            </span>
          </div>
          <p className="message-content">{message.content}</p>
        </div>
      ))}
    </div>
  );
}
