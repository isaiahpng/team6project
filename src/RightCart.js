// RightCart.js
import React, { useState } from 'react';
import './App.css';

const RightCart = ({ cart, setCart, user }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  // Calculate total
  const totalPrice = cart.reduce((total, item) => total + item.Price, 0);

  const placeOrder = async () => {
    const generateNewCartID = async (userID) => {
      try {
        const response = await fetch(`https://team6project.onrender.com/api/getShoppingCartId?userId=${userID}`);
        const data = await response.json();
        return data.ShoppingCartID || Math.floor(Math.random() * 100000);
      } catch (error) {
        console.error("Error fetching ShoppingCartID:", error);
        return Math.floor(Math.random() * 100000);
      }
    };

    try {
      const userIdResponse = await fetch(`https://team6project.onrender.com/api/getUserId?username=${user}`);
      const userIdData = await userIdResponse.json();
      const UserID = userIdData.UserID;

      const ShoppingCartID = await generateNewCartID(UserID);

      const orderDetails = {
        UserID,
        OrderStatus: 'Pending',
        OrderDate: new Date().toISOString(),
        ShoppingCartID,
        CartItems: cart,
      };

      const response = await fetch('https://team6project.onrender.com/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails),
      });

      if (response.ok) {
        alert('Order placed successfully!');
        setCart([]);
      } else {
        throw new Error('Failed to place the order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place the order. Please try again.');
    }
  };

  const removeFromCart = (itemToRemove) => {
    setCart((prevCart) => prevCart.filter((item) => item.ProductID !== itemToRemove.ProductID));
  };

  return (
    <div className="right-cart">
      <h3>Your Cart</h3>
      <div>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div
              className="cart-item"
              key={item.ProductID}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span>{item.ProductName}</span>
              <span>${item.Price.toFixed(2)}</span>
              {hoveredItem === item && (
                <span className="remove-hover" onClick={() => removeFromCart(item)}>
                  Remove
                </span>
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

