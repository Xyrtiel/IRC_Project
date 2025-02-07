import React from 'react';

interface Message {
  type?: 'system' | 'error';
  from?: string;
  content: string;
  channel?: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-grow overflow-y-auto p-4">
      {messages.map((message, index) => (
        <div key={index} className={`mb-2 ${message.type === 'system' ? 'text-gray-500' : message.type === 'error' ? 'text-red-500' : ''}`}>
          {message.from && <span className="font-bold">{message.from}: </span>}
          {message.content}
        </div>
      ))}
    </div>
  );
};

export default MessageList;