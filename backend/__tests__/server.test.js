const request = require('supertest');
const express = require('express');
const mysql = require('mysql');
const app = require('../server');

// Mock MySQL
jest.mock('mysql');

describe('API Endpoints', () => {
  let mockConnection;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock connection
    mockConnection = {
      query: jest.fn(),
      connect: jest.fn(),
      on: jest.fn()
    };
    mysql.createConnection.mockReturnValue(mockConnection);
  });

  describe('GET /api/inventory', () => {
    it('should return all inventory items', async () => {
      const mockInventory = [
        {
          ProductID: 1,
          ProductName: 'Test Product',
          ProductDescription: 'Test Description',
          InventoryQuantity: 10,
          Price: 99.99
        }
      ];

      mockConnection.query.mockImplementation((query, callback) => {
        callback(null, mockInventory);
      });

      const response = await request(app)
        .get('/api/inventory')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(mockInventory);
    });

    it('should handle database errors', async () => {
      mockConnection.query.mockImplementation((query, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/api/inventory')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.error).toBeTruthy();
    });
  });

  describe('POST /api/payment', () => {
    const mockPaymentData = {
      userId: 1,
      amount: 99.99,
      paymentDetails: {
        cardNumber: '4111 1111 1111 1111',
        expiryDate: '12/23',
        cvv: '123',
        nameOnCard: 'John Doe',
        billingAddress: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      }
    };

    it('should process payment successfully', async () => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (typeof params === 'function') {
          callback = params;
        }
        callback(null, { insertId: 1 });
      });

      const response = await request(app)
        .post('/api/payment')
        .send(mockPaymentData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBe(1);
    });

    it('should handle payment processing errors', async () => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (typeof params === 'function') {
          callback = params;
        }
        callback(new Error('Payment processing failed'), null);
      });

      const response = await request(app)
        .post('/api/payment')
        .send(mockPaymentData)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.error).toBe('Failed to process payment');
    });
  });

  describe('POST /api/order', () => {
    const mockOrderData = [
      {
        ProductID: 1,
        Quantity: 2
      }
    ];

    it('should create order successfully', async () => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (typeof params === 'function') {
          callback = params;
        }
        callback(null, { insertId: 1 });
      });

      const response = await request(app)
        .post('/api/order')
        .send(mockOrderData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle order creation errors', async () => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        if (typeof params === 'function') {
          callback = params;
        }
        callback(new Error('Order creation failed'), null);
      });

      const response = await request(app)
        .post('/api/order')
        .send(mockOrderData)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.error).toBeTruthy();
    });
  });
});
