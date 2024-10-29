import React, { useState, useEffect } from 'react';

const InventoryDashboard = ({ addToCart }) => {
    const [inventory, setInventory] = useState([]);
    const [sortOption, setSortOption] = useState('quantityAsc'); // Default sort option

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

    // Function to sort inventory based on selected option
    const sortInventory = () => {
        let sortedInventory = [...inventory];
        switch (sortOption) {
            case 'quantityAsc':
                sortedInventory.sort((a, b) => a.InventoryQuantity - b.InventoryQuantity);
                break;
            case 'quantityDesc':
                sortedInventory.sort((a, b) => b.InventoryQuantity - a.InventoryQuantity);
                break;
            case 'priceAsc':
                sortedInventory.sort((a, b) => a.Price - b.Price);
                break;
            case 'priceDesc':
                sortedInventory.sort((a, b) => b.Price - a.Price);
                break;
            default:
                break;
        }
        return sortedInventory;
    };

    // Get sorted inventory
    const sortedInventory = sortInventory();

    return (
        <div className="inventory-container">
            <div className="sort-controls">
                <label htmlFor="sort">Sort by: </label>
                <select
                    id="sort"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="quantityAsc">Quantity: Low to High</option>
                    <option value="quantityDesc">Quantity: High to Low</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                </select>
            </div>

            {sortedInventory.map(item => (
                <div className="inventory-item" key={item.ProductID} onClick={() => addToCart(item)}>
                    <h3 className="product-name">{item.ProductName}</h3>
                    <p className="product-price">${item.Price.toFixed(2)}</p>
                    {item.InventoryQuantity < 20 && (
                        <p className="low-stock-warning" style={{ color: 'red' }}>Low Stock</p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default InventoryDashboard;

