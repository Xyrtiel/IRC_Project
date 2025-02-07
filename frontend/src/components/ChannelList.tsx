import React from 'react';

interface ChannelListProps {
  channels: string[];
  currentChannel: string;
}

const ChannelList: React.FC<ChannelListProps> = ({ channels, currentChannel }) => {
  return (
    <div className="w-64 bg-gray-100 p-4">
      <h2 className="text-xl mb-4">Channels</h2>
      <ul>
        {channels.map((channel) => (
          <li
            key={channel}
            className={`p-2 ${
              channel === currentChannel ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {channel}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChannelList;