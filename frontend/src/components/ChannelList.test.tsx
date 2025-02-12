// import { render, screen } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import ChannelList from './ChannelList';

// describe('ChannelList', () => {
//   const mockChannels = ['general', 'random', 'help'];
//   const currentChannel = 'general';

//   it('should render all channels', () => {
//     render(<ChannelList channels={mockChannels} currentChannel={currentChannel} />);
    
//     mockChannels.forEach(channel => {
//       expect(screen.getByText(channel)).toBeInTheDocument();
//     });
//   });

//   it('should highlight current channel', () => {
//     render(<ChannelList channels={mockChannels} currentChannel={currentChannel} />);
    
//     const currentChannelElement = screen.getByText(currentChannel);
//     expect(currentChannelElement.parentElement).toHaveClass('bg-blue-500');
//     expect(currentChannelElement.parentElement).toHaveClass('text-white');
//   });

//   it('should not highlight other channels', () => {
//     render(<ChannelList channels={mockChannels} currentChannel={currentChannel} />);
    
//     const otherChannel = screen.getByText('random');
//     expect(otherChannel.parentElement).not.toHaveClass('bg-blue-500');
//     expect(otherChannel.parentElement).not.toHaveClass('text-white');
//   });

//   it('should handle empty channels list', () => {
//     render(<ChannelList channels={[]} currentChannel={currentChannel} />);
//     expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
//   });

//   it('should display channel list title', () => {
//     render(<ChannelList channels={mockChannels} currentChannel={currentChannel} />);
//     expect(screen.getByText('Channels')).toBeInTheDocument();
//   });

//   it('should apply correct width class to container', () => {
//     const { container } = render(
//       <ChannelList channels={mockChannels} currentChannel={currentChannel} />
//     );
//     expect(container.firstChild).toHaveClass('w-64');
//   });

//   it('should render channels with proper list structure', () => {
//     render(<ChannelList channels={mockChannels} currentChannel={currentChannel} />);
//     const list = screen.getByRole('list');
//     const items = screen.getAllByRole('listitem');
    
//     expect(list).toBeInTheDocument();
//     expect(items).toHaveLength(mockChannels.length);
//   });

//   it('should apply padding to all channel items', () => {
//     render(<ChannelList channels={mockChannels} currentChannel={currentChannel} />);
//     const items = screen.getAllByRole('listitem');
    
//     items.forEach(item => {
//       expect(item).toHaveClass('p-2');
//     });
//   });

//   it('should handle undefined current channel', () => {
//     render(<ChannelList channels={mockChannels} currentChannel={currentChannel} />);
    
//     mockChannels.forEach(channel => {   
//       const channelElement = screen.getByText(channel);
//       expect(channelElement.parentElement).not.toHaveClass('bg-blue-500');
//       expect(channelElement.parentElement).not.toHaveClass('text-white');
//     });
//   });
// });