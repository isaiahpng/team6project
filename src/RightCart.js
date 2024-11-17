// RightCart.js
import React, { useState } from 'react';
import './App.css';
import axios from 'axios';


const RightCart = ({ cart, setCart, user}) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  // Calculate total
  const totalPrice = cart.reduce((total, item) => total + item.Price, 0);
  
  const removeFromCart = (itemToRemove) => {
    setCart((prevCart) => prevCart.filter(item => item.ProductID !== itemToRemove.ProductID));
  };

  const placeOrder = async () => {
    const order = {
      UserID: user.UserID,
      OrderStatus: 'Pending',
      OrderDate: new Date().toISOString(),
      ShoppingCartID: user.UserID,
      TotalAmount: totalPrice.toFixed(2),
    };
  
    try {
      const response = await axios.post('https://team6project.onrender.com/api/placeOrder', order);
  
      // Handle response if needed
      console.log('Order placed successfully:', response.data);
  
      // Clear the cart
      setCart([]);
    } catch (error) {
      console.error('Error placing order:', error);
    }
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
