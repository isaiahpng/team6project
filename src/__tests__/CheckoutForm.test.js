import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckoutForm from '../components/CheckoutForm';

describe('CheckoutForm Component', () => {
  const mockProps = {
    open: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    total: 99.99,
    isProcessing: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders checkout form', () => {
    render(<CheckoutForm {...mockProps} />);
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Total: $99.99')).toBeInTheDocument();
  });

  it('validates card number format', async () => {
    render(<CheckoutForm {...mockProps} />);
    
    const cardInput = screen.getByLabelText(/card number/i);
    fireEvent.change(cardInput, { target: { value: '4111111111111111' } });
    
    expect(cardInput.value).toBe('4111 1111 1111 1111');
    
    // Test invalid card number
    fireEvent.change(cardInput, { target: { value: '411111' } });
    fireEvent.blur(cardInput);
    
    expect(screen.getByText(/enter a valid 16-digit card number/i)).toBeInTheDocument();
  });

  it('validates expiry date format', () => {
    render(<CheckoutForm {...mockProps} />);
    
    const expiryInput = screen.getByLabelText(/expiry date/i);
    fireEvent.change(expiryInput, { target: { value: '1223' } });
    
    expect(expiryInput.value).toBe('12/23');
    
    // Test invalid expiry
    fireEvent.change(expiryInput, { target: { value: '13/23' } });
    fireEvent.blur(expiryInput);
    
    expect(screen.getByText(/invalid month/i)).toBeInTheDocument();
  });

  it('validates CVV format', () => {
    render(<CheckoutForm {...mockProps} />);
    
    const cvvInput = screen.getByLabelText(/cvv/i);
    fireEvent.change(cvvInput, { target: { value: '123' } });
    
    expect(cvvInput.value).toBe('123');
    
    // Test invalid CVV
    fireEvent.change(cvvInput, { target: { value: '12' } });
    fireEvent.blur(cvvInput);
    
    expect(screen.getByText(/enter a valid 3-digit cvv/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<CheckoutForm {...mockProps} />);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/card number/i), {
      target: { value: '4111111111111111' }
    });
    fireEvent.change(screen.getByLabelText(/expiry date/i), {
      target: { value: '1223' }
    });
    fireEvent.change(screen.getByLabelText(/cvv/i), {
      target: { value: '123' }
    });
    fireEvent.change(screen.getByLabelText(/name on card/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/billing address/i), {
      target: { value: '123 Main St' }
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: 'Anytown' }
    });
    fireEvent.change(screen.getByLabelText(/state/i), {
      target: { value: 'CA' }
    });
    fireEvent.change(screen.getByLabelText(/zip code/i), {
      target: { value: '12345' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));

    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalledWith({
        cardNumber: '4111 1111 1111 1111',
        expiryDate: '12/23',
        cvv: '123',
        nameOnCard: 'John Doe',
        billingAddress: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      });
    });
  });

  it('disables form submission while processing', () => {
    render(<CheckoutForm {...mockProps} isProcessing={true} />);
    
    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
  });
});
