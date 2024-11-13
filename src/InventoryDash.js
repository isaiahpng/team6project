import React, { useState, useEffect } from 'react';

const InventoryDashboard = ({ addToCart }) => {
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        // Fetch inventory data from the backend
        fetch('https://team6project.onrender.com/api/inventory')
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

    return (
        <div className="inventory-container">
            {inventory.map(item => (
                <div className="inventory-item" key={item.ProductID} onClick={() => addToCart(item)}>
                    <div class="image-container">
                        <img src={item.imageUrl} alt={item.ProductName} className="product-image" /> {/* Display product image */}
                    </div>
                    <h3 className="product-name">{item.ProductName}</h3>
                    <p className="product-price">${item.Price.toFixed(2)}</p>
                    <p className="product-description">{item.ProductDescription}</p>
                </div>
            ))}
        </div>
    );
};

export default InventoryDashboard;

