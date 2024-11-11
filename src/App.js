import React, { useEffect, useState } from 'react';
import './App.css';
import TopNav from './TopNav';
import LeftNav from './LeftNav';
import RightCart from './RightCart';
import InventoryDashboard from './InventoryDash';
import Signup from './signup/Signup';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Login from './login/login';

function App() {
    const route = createBrowserRouter([
        {
          path: "/",
          element: <Signup />,
        },
        {
          path: "/login",
          element: <Login />,
        },
      ])
      
    const [cart, setCart] = useState([]); // State for cart
    const [user, setUser] = useState(null); // State for logged-in user

    const addToCart = (item) => {
        // Function to add an item to the cart
        setCart((prevCart) => [...prevCart, item]);
    };

    const handleLogin = (username) => {
        // Function to handle user login
        setUser(username);
    };

    const handleLogout = () => {
        // Function to handle user logout
        setUser(null);
        setCart([]); // Optionally clear the cart when the user logs out
    };

    return (
        <div className="app-container">
            <TopNav user={user} onLogin={handleLogin} onLogout={handleLogout} /> {/* Pass user, onLogin, and onLogout */}
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


