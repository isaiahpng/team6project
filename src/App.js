import React, { useEffect, useState } from 'react';
import './App.css';
import TopNav from './TopNav';
import LeftNav from './LeftNav';
import RightCart from './RightCart';
import InventoryDashboard from './InventoryDash';
import Signup from './signup/Signup';
import Login from './login/login';
import OrderHistory from './OrderHistory';
import Inventory from './Inventory';
import NewInventory from './NewInventory'; // Import the NewInventory component
import OrderHistoryAdmin from './OrderHistoryAdmin'; // Import the NewInventory component

function App() {
    const [cart, setCart] = useState([]); // State for cart
    const [user, setUser] = useState(null); // State for logged-in user
    const [isAdmin, setIsAdmin] = useState(false); // State for admin role
    const [activePage, setActivePage] = useState('Dashboard'); // State to track active page

    const addToCart = (item) => {
        setCart((prevCart) => [...prevCart, item]);
    };

    const handleLogin = (user) => {
        setUser(user.username);
        setIsAdmin(user.isAdmin); // Update isAdmin state based on login
    };

    const handleLogout = () => {
        setUser(null);
        setIsAdmin(false); // Reset isAdmin state
        setCart([]); // Optionally clear the cart when the user logs out
    };

    // Function to render the active page component
    const renderPage = () => {
        switch (activePage) {
            case 'Dashboard':
                return <InventoryDashboard addToCart={addToCart} />;
            case 'Order History':
                return <OrderHistory user={user} />; // Pass user prop to OrderHistory
            case 'Inventory':
                return <Inventory user={user} />; // Pass user prop to Inventory
            case 'New Inventory':
                return <NewInventory />; // Render NewInventory form page        
            case 'Admin Order History':
                return <OrderHistoryAdmin />; // Render NewInventory form page        
            default:
                return <InventoryDashboard addToCart={addToCart} />;
        }
    };

    return (
        <div className="app-container">
            <TopNav user={user} onLogin={handleLogin} onLogout={handleLogout} />
            <div className="main-content">
                <LeftNav setActivePage={setActivePage} isAdmin={isAdmin} /> {/* Pass setActivePage to LeftNav */}
                <div className="dashboard">
                    <h1>{activePage}</h1> {/* Display the active page title */}
                    {renderPage()} {/* Render the active page component */}
                </div>
                <RightCart cart={cart} setCart={setCart} user={user} /> {/* Pass user here */}
            </div>
        </div>
    );
}

export default App;
