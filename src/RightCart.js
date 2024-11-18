// RightCart.js
import React, { useState } from "react";
import "./App.css";
import { axios } from "./utils";

const RightCart = ({ cart, user, fetchCart }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  // Calculate total
  const totalPrice = cart.reduce(
    (total, item) => total + parseFloat(item.Price) * item.ProductQuantity,
    0
  );

  const removeFromCart = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const item = cart.find((item) => item.ProductID === id);

      if (item && item.ProductQuantity > 1) {
        await axios.put(
          `/cart/items/${id}`,
          { quantity: item.ProductQuantity - 1 },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.delete(`/cart/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      await fetchCart(token);
    } catch (error) {
      alert("Error", error);
    }
  };

  const placeOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/cart/checkout",
        {
          paymentDetails: {
            type: "Credit Card",
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Order Placed");
      window.location.reload();
    } catch (error) {
      alert(error.error);
    }

    // try {
    //   const response = await axios.post(
    //     "https://team6project.onrender.com/api/placeOrder",
    //     order
    //   );

    //   // Handle response if needed
    //   console.log("Order placed successfully:", response.data);

    //   // Clear the cart
    //   setCart([]);
    // } catch (error) {
    //   console.error("Error placing order:", error);
    // }
  };
  return (
    <div className="right-cart">
      <h3>Your Cart</h3>
      <div>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p> // Message when cart is empty
        ) : (
          cart.map((item) => (
            <div
              className="cart-item-container"
              key={item.ProductID}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="cart-item">
                <span>
                  {item.ProductName} {`(${item.ProductQuantity})`}
                </span>
                <span>${item.Price}</span>
              </div>
              {hoveredItem === item && (
                <span
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.ProductID)}
                >
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
