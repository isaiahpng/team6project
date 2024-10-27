import React, { useEffect, useState } from 'react';
import './App.css';
import TopNav from './TopNav';
import LeftNav from './LeftNav';
import RightCart from './RightCart';
import InventoryDashboard from './InventoryDash';

function App() {
    const [cart, setCart] = useState([]); // Initialize cart state

    const addToCart = (item) => {
        // Function to add an item to the cart
        setCart((prevCart) => [...prevCart, item]);
    };

    return (
        <div className="app-container">
            <TopNav />
            <div className="main-content">
                <LeftNav />
                <div className="dashboard">
                    <h1>Dashboard</h1>
                    <InventoryDashboard addToCart={addToCart} /> {/* Pass the addToCart function */}
                </div>
                <RightCart cart={cart} setCart={setCart} /> {/* Pass cart state and setter */}
            </div>
        </div>
    );
}

export default App;

