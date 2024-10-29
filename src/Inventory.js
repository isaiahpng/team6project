import React, { useState, useEffect } from 'react';
import './App.css'; // Make sure to import your styles

const Inventory = ({ user }) => {
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        // Fetch inventory data from the backend
        fetch('http://localhost:3001/api/inventory')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setInventory(data);
            })
            .catch(error => {
                console.error('Error fetching inventory data:', error);
            });
    }, []);

    // Check if user is logged in
    if (!user) {
        return <div>Please log in to view the inventory.</div>; // Show message for non-logged-in users
    }

    return (
        <div className="inventory-container">
            {inventory.map(item => (
                <div className="inventory-item" key={item.ProductID}>
                    {/* <img src={item.imageUrl} alt={item.ProductName} className="product-image" /> */} {/* Implementing Pictures Later */}
                    <h3 className="product-name">{item.ProductName}</h3>
                    <p className="product-price">${item.Price ? item.Price.toFixed(2) : '0.00'}</p>
                    <p className="inventory-quantity">
                        In Stock: {item.InventoryQuantity}
                        {/* Display low stock warning if inventory is below 50 */}
                        {item.InventoryQuantity < 30 && (
                            <span className="low-stock-warning"> (Low Stock!)</span>
                        )}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default Inventory;
