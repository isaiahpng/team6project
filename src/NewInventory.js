// NewInventory.js
import React, { useState } from 'react';
import './App.css';

// Component for adding new inventory items
const NewInventory = () => {
  // Form state
  const [product, setProduct] = useState({
    ProductName: '',
    ProductDescription: '',
    InventoryQuantity: '',
    Price: '',
    Tag: '',
    imageUrl: ''
  });

  // Message states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert number inputs
    if (type === 'number') {
      setProduct(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
      return;
    }

    // Handle other inputs
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!product.ProductName?.trim()) {
      setError('Please enter a product name');
      return;
    }

    if (!product.InventoryQuantity || product.InventoryQuantity < 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (!product.Price || product.Price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    try {
      const response = await fetch('https://team6project.onrender.com/api/add-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...product,
          InventoryQuantity: Math.floor(Number(product.InventoryQuantity)),
          Price: Number(product.Price).toFixed(2)
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add item');
      }

      setSuccess('Item added successfully!');
      
      // Reset form
      setProduct({
        ProductName: '',
        ProductDescription: '',
        InventoryQuantity: '',
        Price: '',
        Tag: '',
        imageUrl: ''
      });
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="new-inventory-form">
      <h2>Add New Item</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="ProductName"
            value={product.ProductName}
            onChange={handleChange}
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label>Description:</label>
          <textarea
            name="ProductDescription"
            value={product.ProductDescription || ''}
            onChange={handleChange}
            rows="4"
            placeholder="Enter product details"
            style={{ width: '100%', minHeight: '100px', padding: '8px' }}
          />
        </div>

        <div>
          <label>Quantity:</label>
          <input
            type="number"
            name="InventoryQuantity"
            value={product.InventoryQuantity}
            onChange={handleChange}
            min="0"
            placeholder="0"
          />
        </div>

        <div>
          <label>Price:</label>
          <input
            type="number"
            name="Price"
            value={product.Price}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div>
          <label>Tag:</label>
          <input
            type="text"
            name="Tag"
            value={product.Tag}
            onChange={handleChange}
            placeholder="Product category"
          />
        </div>

        <div>
          <label>Image URL:</label>
          <input
            type="text"
            name="imageUrl"
            value={product.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <button type="submit">Add Item</button>
      </form>
    </div>
  );
};

export default NewInventory;
