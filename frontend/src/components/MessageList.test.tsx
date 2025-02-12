// import { render, screen } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import MessageList from './MessageList';

// describe('MessageList', () => {
//   const mockMessages = [
//     { content: 'Hello', from: 'user1' },
//     { content: 'User joined', type: 'system' as const },
//     { content: 'Error occurred', type: 'error' as const }
//   ];

//   it('should render all messages', () => {
//     render(<MessageList messages={mockMessages} />);
//     expect(screen.getByText('Hello')).toBeInTheDocument();
//     expect(screen.getByText('User joined')).toBeInTheDocument();
//     expect(screen.getByText('Error occurred')).toBeInTheDocument();
//   });


//   it('should apply correct styles to different message types', () => {
//     render(<MessageList messages={mockMessages} />);
    
//     expect(screen.getByText('User joined').parentElement).toHaveClass('text-gray-500');
//     expect(screen.getByText('Error occurred').parentElement).toHaveClass('text-red-500');
//   });

//   it('should handle empty message list', () => {
//     render(<MessageList messages={[]} />);
//     expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
//   });
// });