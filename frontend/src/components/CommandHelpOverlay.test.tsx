// import { render, fireEvent, screen } from '@testing-library/react';
// import { CommandHelpButton, CommandHelpOverlay } from './CommandHelpOverlay';

// describe('CommandHelpOverlay', () => {
//   it('should not render when closed', () => {
//     render(<CommandHelpOverlay isOpen={false} onClose={() => {}} />);
//     expect(screen.queryByText('Commandes Disponibles')).not.toBeInTheDocument();
//   });

//   it('should render when open', () => {
//     render(<CommandHelpOverlay isOpen={true} onClose={() => {}} />);
//     expect(screen.getByText('Commandes Disponibles')).toBeInTheDocument();
//   });

//   it('should call onClose when clicking outside', () => {
//     const onClose = jest.fn();
//     render(<CommandHelpOverlay isOpen={true} onClose={onClose} />);
    
//     fireEvent.click(screen.getByText('Commandes Disponibles').parentElement!.parentElement!);
//     expect(onClose).toHaveBeenCalled();
//   });
// });
