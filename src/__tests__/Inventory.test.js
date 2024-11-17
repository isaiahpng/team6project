import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Inventory from '../Inventory';

// Mock the fetch function
global.fetch = jest.fn();

describe('Inventory Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders inventory table', () => {
    render(<Inventory />);
    expect(screen.getByText(/Inventory/i)).toBeInTheDocument();
  });

  it('loads inventory items on mount', async () => {
    const mockData = [
      {
        ProductID: 1,
        ProductName: 'Test Product',
        ProductDescription: 'Test Description',
        InventoryQuantity: 10,
        Price: 99.99,
        Tag: 'Test'
      }
    ];

    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    );

    render(<Inventory />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });
  });

  it('handles inventory load error', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to load'))
    );

    render(<Inventory />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading inventory/i)).toBeInTheDocument();
    });
  });

  it('deletes inventory item', async () => {
    const mockData = [
      {
        ProductID: 1,
        ProductName: 'Test Product',
        InventoryQuantity: 10,
        Price: 99.99
      }
    ];

    fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData)
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Item deleted' })
        })
      );

    render(<Inventory />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch.mock.calls[1][1].method).toBe('DELETE');
    });
  });
});
