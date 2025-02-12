// import { render, fireEvent, screen } from '@testing-library/react';
// import ChatInput from './ChatInput';

// describe('ChatInput', () => {
//   const mockOnSendMessage = jest.fn();

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should call onSendMessage with input value when form is submitted', () => {
//     render(<ChatInput onSendMessage={mockOnSendMessage} />);
//     const input = screen.getByPlaceholderText('Type a message or command...');
    
//     fireEvent.change(input, { target: { value: 'Hello world' } });
//     fireEvent.submit(input.closest('form')!);

//     expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world');
//   });

//   it('should clear input after submission', () => {
//     render(<ChatInput onSendMessage={mockOnSendMessage} />);
//     const input = screen.getByPlaceholderText('Type a message or command...');
    
//     fireEvent.change(input, { target: { value: 'Hello world' } });
//     fireEvent.submit(input.closest('form')!);

//     expect(input).toHaveValue('');
//   });

//   it('should not call onSendMessage when input is empty', () => {
//     render(<ChatInput onSendMessage={mockOnSendMessage} />);
//     const input = screen.getByPlaceholderText('Type a message or command...');
    
//     fireEvent.submit(input.closest('form')!);

//     expect(mockOnSendMessage).not.toHaveBeenCalled();
//   });

//   it('should not call onSendMessage when input contains only whitespace', () => {
//     render(<ChatInput onSendMessage={mockOnSendMessage} />);
//     const input = screen.getByPlaceholderText('Type a message or command...');
    
//     fireEvent.change(input, { target: { value: '   ' } });
//     fireEvent.submit(input.closest('form')!);

//     expect(mockOnSendMessage).not.toHaveBeenCalled();
//   });
// });