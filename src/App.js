import React, { useEffect, useState } from 'react';
import './App.css';
import TopNav from './TopNav';
import LeftNav from './LeftNav';
import RightCart from './RightCart';
import InventoryDashboard from './InventoryDash';
import Signup from './signup/Signup';
// import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Login from './login/login';
import OrderHistory from './OrderHistory';
import Inventory from './Inventory';

function App() {
    const [cart, setCart] = useState([]); // State for cart
    const [user, setUser] = useState(null); // State for logged-in user
    const [activePage, setActivePage] = useState('Dashboard'); // State to track active page
    // const [isAdmin, setIsAdmin] = useState(false); // State for admin role

    const addToCart = (item) => {
        setCart((prevCart) => [...prevCart, item]);
    };

    const handleLogin = (username) => {
        console.log("Logging in with username:", username); // Log login action
        setUser(username);
        // setIsAdmin(isAdmin); // Update isAdmin state based on login
    };

    const handleLogout = () => {
        setUser(null);
        // setIsAdmin(false); // Reset isAdmin state
        setCart([]); // Optionally clear the cart when the user logs out
    };

    // Function to render the active page component
    const renderPage = () => {
        // Admins can see all pages
        // if (isAdmin) {
        //     switch (activePage) {
        //         case 'Dashboard':
        //             return <InventoryDashboard addToCart={addToCart} />;
        //         case 'Order History':
        //             return <OrderHistory user={user} />; // Pass user prop to OrderHistory
        //         case 'Inventory':
        //             return <Inventory user={user} />; // Pass user prop to Inventory
        //         default:
        //             return <InventoryDashboard addToCart={addToCart} />;
        //     }
        // } else {
        //     switch (activePage) {
        //         case 'Dashboard':
        //             return <InventoryDashboard addToCart={addToCart} />;
        //         case 'Order History':
        //             return <OrderHistory user={user} />; // Pass user prop to OrderHistory
        //         default:
        //             return <InventoryDashboard addToCart={addToCart} />;
        //     }
        // }
        switch (activePage) {
            case 'Dashboard':
                return <InventoryDashboard addToCart={addToCart} />;
            case 'Order History':
                return <OrderHistory user={user} />; // Pass user prop to OrderHistory
            case 'Inventory':
                return <Inventory user={user} />; // Pass user prop to Inventory
            default:
                return <InventoryDashboard addToCart={addToCart} />;
        }
    };

    return (
        <div className="app-container">
            <TopNav user={user} onLogin={handleLogin} onLogout={handleLogout} />
            <div className="main-content">
                <LeftNav setActivePage={setActivePage} /> {/* Pass setActivePage to LeftNav */}
                <div className="dashboard">
                    <h1>{activePage}</h1> {/* Display the active page title */}
                    {renderPage()} {/* Render the appropriate page based on activePage */}
                </div>
                <RightCart cart={cart} setCart={setCart} user={user} /> {/* Pass user here */}
            </div>
        </div>
    );
}

export default App;

