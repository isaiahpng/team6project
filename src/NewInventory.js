// NewInventory.js
import React, { useState } from 'react';
import './App.css';

const NewInventory = () => {
  const [product, setProduct] = useState({
    ProductName: '',
    ProductDescription: '',
    InventoryQuantity: 0,
    Price: 0.0,
    inventorycol: '',
    Tag: '',
    imageUrl: ''
  });

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('https://team6project.onrender.com/api/add-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });
      if (response.ok) {
        alert('Inventory item added successfully!');
        setProduct({
          ProductName: '',
          ProductDescription: '',
          InventoryQuantity: 0,
          Price: 0.0,
          inventorycol: '',
          Tag: '',
          imageUrl: ''
        });
      } else {
        alert('Failed to add inventory item.');
      }
    } catch (error) {
      console.error('Error adding inventory item:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Inventory</h2>
      <input type="text" name="ProductName" value={product.ProductName} onChange={handleChange} placeholder="Product Name" required />
      <input type="text" name="ProductDescription" value={product.ProductDescription} onChange={handleChange} placeholder="Product Description" />
      <input type="number" name="InventoryQuantity" value={product.InventoryQuantity} onChange={handleChange} placeholder="Quantity" required />
      <input type="number" name="Price" step="0.01" value={product.Price} onChange={handleChange} placeholder="Price" required />
      <input type="text" name="inventorycol" value={product.inventorycol} onChange={handleChange} placeholder="Inventory Column" />
      <input type="text" name="Tag" value={product.Tag} onChange={handleChange} placeholder="Tag" />
      <input type="text" name="imageUrl" value={product.imageUrl} onChange={handleChange} placeholder="Image URL" />
      <button type="submit">Add Inventory</button>
    </form>
  );
};

export default NewInventory;
