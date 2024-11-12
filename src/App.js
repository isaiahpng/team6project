import React, { useEffect, useState } from 'react';
import './App.css';
import TopNav from './TopNav';
import LeftNav from './LeftNav';
import RightCart from './RightCart';
import InventoryDashboard from './InventoryDash';
import Signup from './signup/Signup';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Login from './login/login';
import OrderHistory from './OrderHistory';
import Inventory from './Inventory';

function App() {
    const route = createBrowserRouter([
        {
          path: "/signup",
          element: <Signup />,
        },
        {
          path: "/login",
          element: <Login />,
        },
      ])

    const [cart, setCart] = useState([]); // State for cart
    const [user, setUser] = useState(null); // State for logged-in user
    const [activePage, setActivePage] = useState('Dashboard'); // State to track active page

    const addToCart = (item) => {
        setCart((prevCart) => [...prevCart, item]);
    };

    const handleLogin = (username) => {
        setUser(username);
    };

    const handleLogout = () => {
        setUser(null);
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
                    <h1>Dashboard</h1>
                    <InventoryDashboard addToCart={addToCart} /> {/* Pass the addToCart function */}
                    <RouterProvider router={route}></RouterProvider>
                    {renderPage()}
                </div>
                <RightCart cart={cart} setCart={setCart} user={user} /> {/* Pass user here */}
            </div>
        </div>
    );
}

export default App;


