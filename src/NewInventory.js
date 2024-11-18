// NewInventory.js
import React, { useState, useEffect } from "react";
import { axios } from "./utils";
import "./App.css";

const NewInventory = () => {
  const [tags, setTags] = useState([]);
  const [product, setProduct] = useState({
    productName: "",
    price: "",
    productDescription: "",
    inventoryQuantity: "",
    tag: "",
    imageUrl: "",
  });

  useEffect(() => {
    (async () => {
      const response = await axios.get("/inventory/tag");
      setTags(response.data.tags);
    })();
  }, []);

  const handleChange = (e) => {
    setProduct((state) => {
      const copy = {
        ...state,
      };
      copy[e.target.name] = e.target.value;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("/inventory", product, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Product created successfully");
      setProduct({
        productName: "",
        price: "",
        productDescription: "",
        inventoryQuantity: "",
        tag: "",
        imageUrl: "",
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Inventory</h2>
      <input
        type="text"
        name="productName"
        value={product.ProductName}
        onChange={handleChange}
        placeholder="Product Name"
        required
      />
      <input
        type="text"
        name="productDescription"
        value={product.ProductDescription}
        onChange={handleChange}
        placeholder="Product Description"
      />
      <input
        type="number"
        name="inventoryQuantity"
        value={product.InventoryQuantity}
        onChange={handleChange}
        placeholder="Quantity"
        required
      />
      <input
        type="number"
        name="price"
        step="0.01"
        value={product.Price}
        onChange={handleChange}
        placeholder="Price"
        required
      />
      <select name="tag" onChange={handleChange}>
        {tags.map((tag) => (
          <option value={tag}>{tag}</option>
        ))}
      </select>
      <input
        type="text"
        name="imageUrl"
        value={product.imageUrl}
        onChange={handleChange}
        placeholder="Image URL"
      />
      <button type="submit">Add Inventory</button>
    </form>
  );
};

export default NewInventory;
