import { axios } from "./utils";
import React, { useState, useEffect } from "react";

const InventoryDashboard = ({ fetchCart, cart }) => {
  const [nextPage, setNextPage] = useState(null);
  const [inventory, setInventory] = useState([]);

  const fetchInventory = async (page, initial) => {
    try {
      const response = await axios.get(`/inventory?page=${page}`);
      setInventory((state) => {
        if (initial) {
          const copy = [...response.data.inventory];
          return copy;
        } else {
          const copy = [...state, ...response.data.inventory];
          return copy;
        }
      });
      setNextPage(response.data.pagination.nextPage);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  };
  const addToCart = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const item = cart.find((item) => item.ProductID === id);
      if (item) {
        await axios.put(
          `/cart/items/${id}`,
          { quantity: item.ProductQuantity + 1 },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          `/cart`,
          { productId: id, quantity: 1 },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      await fetchCart(token);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInventory(1, true);
  }, []);

  return (
    <div>
      <div className="inventory-container">
        {inventory.map((item) => (
          <div
            className="inventory-item"
            key={item.ProductID}
            onClick={() => addToCart(item.ProductID)}
          >
            <div class="image-container">
              <img
                src={item.imageUrl}
                alt={item.ProductName}
                className="product-image"
              />{" "}
              {/* Display product image */}
            </div>
            <h3 className="product-name">{item.ProductName}</h3>
            <p className="product-price">${item.Price}</p>
            <p className="product-description">{item.ProductDescription}</p>
          </div>
        ))}
      </div>
      <div className="center">
        {nextPage ? (
          <button className="button" onClick={() => fetchInventory(nextPage)}>
            Load more
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default InventoryDashboard;
