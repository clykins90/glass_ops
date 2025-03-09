/** @jest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationDialog from '../ConfirmationDialog';

describe('ConfirmationDialog', () => {
  test('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConfirmationDialog
        isOpen={false}
        title="Test Title"
        message="Test Message"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('renders dialog with correct content when isOpen is true', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  test('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('disables buttons when isLoading is true', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        isLoading={true}
      />
    );
    
    expect(screen.getByRole('button', { name: /Processing/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
  });

  test('uses custom button labels when provided', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    expect(screen.getByRole('button', { name: /Yes, Delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /No, Keep/i })).toBeInTheDocument();
  });
}); 