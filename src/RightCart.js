// RightCart.js
import React, { useState } from 'react';
import './App.css';

const RightCart = ({ cart, setCart }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  // Calculate total
  const totalPrice = cart.reduce((total, item) => total + item.Price, 0);

  const placeOrder = async () => {
    try {
      const response = await fetch('https://team6project.onrender.com/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cart), // Convert cart items to JSON
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      alert('Order placed successfully!');
      setCart([]); // Clear cart after order is placed
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place the order. Please try again.');
    }
  };

  const removeFromCart = (itemToRemove) => {
    setCart((prevCart) => prevCart.filter(item => item.ProductID !== itemToRemove.ProductID));
  };

  return (
    <div className="right-cart">
      <h3>Your Cart</h3>
      <div>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p> // Message when cart is empty
        ) : (
          cart.map(item => (
            <div className="cart-item" key={item.ProductID} onMouseEnter={() => setHoveredItem(item)} onMouseLeave={() => setHoveredItem(null)}>
              <span>{item.ProductName}</span>
              <span>${item.Price.toFixed(2)}</span>
              {hoveredItem === item && (
                <span className="remove-hover" onClick={() => removeFromCart(item)}>Remove</span>
              )}
            </div>
          ))
        )}
      </div>
      <div className="cart-total">
        <p>Subtotal: ${totalPrice.toFixed(2)}</p>
        <button onClick={placeOrder}>Place Order</button>
      </div>
    </div>
  );
};

export default RightCart;
