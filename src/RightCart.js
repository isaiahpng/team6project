// RightCart.js
import React, { useState } from 'react';
import './App.css';
import CheckoutForm from './components/CheckoutForm';
import { Snackbar, Alert } from '@mui/material';

const RightCart = ({ cart, setCart, user }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Calculate total
  const totalPrice = cart.reduce((total, item) => total + item.Price, 0);

  const handleCheckout = async (paymentData) => {
    setIsProcessing(true);
    
    try {
      // Map cart items to include ProductID and Quantity
      const cartItems = cart.map(item => ({
        ProductID: item.ProductID,
        Quantity: 1 // You can modify this if you implement quantity selection
      }));

      // First save payment information
      const paymentResponse = await fetch('https://team6project.onrender.com/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          amount: totalPrice,
          paymentDetails: paymentData
        })
      });

      if (!paymentResponse.ok) {
        throw new Error('Payment failed');
      }

      // Then place the order
      const orderResponse = await fetch('https://team6project.onrender.com/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartItems)
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to place order');
      }

      // Clear the cart and close checkout
      setCart([]);
      setIsCheckoutOpen(false);
      setSnackbar({
        open: true,
        message: 'Order placed successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error during checkout:', error);
      setSnackbar({
        open: true,
        message: 'Failed to process order. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <div className="right-cart">
      <h2>Shopping Cart</h2>
      <div className="cart-items">
        {cart.map((item, index) => (
          <div
            key={index}
            className="cart-item"
            onMouseEnter={() => setHoveredItem(index)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <span>{item.ProductName}</span>
            <span>${item.Price.toFixed(2)}</span>
            {hoveredItem === index && (
              <button
                className="remove-button"
                onClick={() => removeFromCart(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="cart-total">
        <strong>Total: ${totalPrice.toFixed(2)}</strong>
      </div>
      <button
        className="checkout-button"
        onClick={() => setIsCheckoutOpen(true)}
        disabled={cart.length === 0}
      >
        Check Out
      </button>

      <CheckoutForm 
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSubmit={handleCheckout}
        total={totalPrice}
        isProcessing={isProcessing}
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RightCart;
