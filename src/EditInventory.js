// NewInventory.js
import React, { useState, useEffect } from "react";
import { axios } from "./utils";
import "./App.css";

const EditInventory = ({ data, onClose }) => {
  console.log(data);
  const [tags, setTags] = useState([]);
  const [product, setProduct] = useState({
    productName: data.ProductName,
    price: data.Price,
    productDescription: data.ProductDescription,
    inventoryQuantity: data.InventoryQuantity,
    tag: data.Tag,
    imageUrl: data.imageUrl,
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
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/inventory/${data.ProductID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Product deleted successfully");
      onClose();
    } catch (error) {
      alert("Error:", error.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/inventory/${data.ProductID}`, product, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Product updated successfully");
      onClose();
    } catch (error) {
      alert("Error:", error.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Inventory</h2>
      <input
        type="text"
        name="productName"
        value={product.productName}
        onChange={handleChange}
        placeholder="Product Name"
        required
      />
      <input
        type="text"
        name="productDescription"
        value={product.productDescription}
        onChange={handleChange}
        placeholder="Product Description"
      />
      <input
        type="number"
        name="inventoryQuantity"
        value={product.inventoryQuantity}
        onChange={handleChange}
        placeholder="Quantity"
        required
      />
      <input
        type="number"
        name="price"
        step="0.01"
        value={product.price}
        onChange={handleChange}
        placeholder="Price"
        required
      />
      <select name="tag" value={product.tag} onChange={handleChange}>
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
      <button type="submit">Edit Inventory</button>
      <p className="delete" onClick={handleDelete}>
        Delete Inventory
      </p>
    </form>
  );
};

export default EditInventory;
