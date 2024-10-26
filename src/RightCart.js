// RightCart.js
import React, { useState } from 'react';
import './App.css';

const RightCart = () => {
  // Example cart data
  const [cart, setCart] = useState([
    { id: 1, name: 'Vegetable Burger', price: 25 },
    { id: 2, name: 'Meat Burger', price: 28 },
    { id: 3, name: 'Cheese Burger', price: 32 },
  ]);

  // Calculate total
  const totalPrice = cart.reduce((total, item) => total + item.price, 0);

  const placeOrder = () => {
    // Logic to place the order and update inventory
    alert('Order placed successfully!');
    setCart([]); // Clear cart after order is placed
  };

  return (
    <div className="right-cart">
      <h3>Your Cart</h3>
      <ul>
        {cart.map(item => (
          <li key={item.id}>
            {item.name} - ${item.price}
          </li>
        ))}
      </ul>
      <div className="cart-total">
        <p>Subtotal: ${totalPrice}</p>
        <button onClick={placeOrder}>Place Order</button>
      </div>
    </div>
  );
};

export default RightCart;
