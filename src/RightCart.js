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
      // Map cart items to include ProductID and Quantity
      const cartItems = cart.map(item => ({
        ProductID: item.ProductID,
        Quantity: 1 // You can modify this if you implement quantity selection
      }));

      // Place the order
      const response = await fetch('https://team6project.onrender.com/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartItems)
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      // Clear the cart after successful order
      setCart([]);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
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
        className="place-order-button"
        onClick={placeOrder}
        disabled={cart.length === 0}
      >
        Place Order
      </button>
    </div>
  );
};

export default RightCart;
