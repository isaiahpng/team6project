// RightCart.js
import React, { useState } from 'react';
import './App.css';

const RightCart = ({ cart, setCart, user}) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  // Calculate total
  const totalPrice = cart.reduce((total, item) => total + item.Price, 0);

  const placeOrder = async () => {
    // Function to get or generate a ShoppingCartID
    const generateNewCartID = async (userID) => {
      try {
        const response = await fetch(`https://team6project.onrender.com/api/getShoppingCartId?userId=${userID}`);
        const data = await response.json();
        return data.ShoppingCartID || Math.floor(Math.random() * 100000); // Generate new ID if none exists
      } catch (error) {
        console.error("Error fetching ShoppingCartID:", error);
        return Math.floor(Math.random() * 100000); // Fallback ID
      }
    };
  
    try {
      // Fetch the UserID using the logged-in username
      const userIdResponse = await fetch(`https://team6project.onrender.com/api/getUserId?username=${user}`);
      const userIdData = await userIdResponse.json();
      const UserID = userIdData.UserID; // Assuming UserID is returned in response
  
      // Generate or retrieve the ShoppingCartID
      const ShoppingCartID = await generateNewCartID(UserID);
  
      // Prepare order details
      const orderDetails = {
        UserID,
        OrderStatus: 'Pending', // Always Pending
        OrderDate: new Date().toISOString(), // Current date and time
        ShoppingCartID,
        CartItems: cart, // Include cart items
      };
  
      // Send the order data to the backend
      const response = await fetch('https://team6project.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails),
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
