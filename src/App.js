import React, { useState } from 'react';
import './App.css';
import TopNav from './TopNav';
import LeftNav from './LeftNav';
import RightCart from './RightCart';
import InventoryDashboard from './InventoryDash';
import OrderHistory from './OrderHistory';
import Inventory from './Inventory';
import NewInventory from './NewInventory'; // Import the NewInventory component

function App() {
    const [cart, setCart] = useState([]); // State for cart
    const [user, setUser] = useState(null); // State for logged-in user
    const [activePage, setActivePage] = useState('Dashboard'); // State to track active page

    // Add to cart function with user check
    const addToCart = (item) => {
        if (user) {
            setCart((prevCart) => [...prevCart, item]);
        } else {
            alert("Please log in to add items to your cart.");
        }
    };

    // Handle user login
    const handleLogin = (username) => {
        setUser(username);
    };

    // Handle user logout and clear cart
    const handleLogout = () => {
        setUser(null);
        setCart([]); // Clear the cart when the user logs out
    };

    // Function to render the active page component
    const renderPage = () => {
        switch (activePage) {
            case 'Dashboard':
                return <InventoryDashboard addToCart={addToCart} user={user} />; // Pass user if needed
            case 'Order History':
                return <OrderHistory user={user} />; // Pass user to OrderHistory
            case 'Inventory':
                return <Inventory user={user} />; // Pass user to Inventory
            case 'New Inventory':
                return <NewInventory />; // Render NewInventory form page
            default:
                return <InventoryDashboard addToCart={addToCart} user={user} />;
        }
    };

    return (
        <div className="app-container">
            <TopNav user={user} onLogin={handleLogin} onLogout={handleLogout} />
            <div className="main-content">
                <LeftNav setActivePage={setActivePage} user={user} /> {/* Pass setActivePage to LeftNav */}
                <div className="dashboard">
                    <h1>{activePage}</h1> {/* Display the active page title */}
                    {renderPage()} {/* Render the appropriate page based on activePage */}
                </div>
                <RightCart cart={cart} setCart={setCart} user={user} /> {/* Pass user to RightCart */}
            </div>
        </div>
    );
}

export default App;


