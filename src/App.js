import React, { useState } from 'react';
import './App.css';
import TopNav from './TopNav';
import LeftNav from './LeftNav';
import RightCart from './RightCart';
import InventoryDashboard from './InventoryDash';
import OrderHistory from './OrderHistory';
import Inventory from './Inventory';
import NewInventory from './NewInventory';
import OrderHistoryAdmin from './OrderHistoryAdmin';
import Login from './Login';

function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null); // State for logged-in user
  const [isAdmin, setIsAdmin] = useState(false); // State for admin role
  const [activePage, setActivePage] = useState('Dashboard');

  const addToCart = (item) => {
    setCart((prevCart) => [...prevCart, item]);
  };

  const handleLogin = (userData) => {
    setUser(userData.username);
    setIsAdmin(userData.isAdmin); // Update isAdmin state based on login
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setCart([]);
    setActivePage('Dashboard');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <InventoryDashboard addToCart={addToCart} />;
      case 'Order History':
        return <OrderHistory user={user} />;
      case 'Inventory':
        return <Inventory user={user} />;
      case 'New Inventory':
        return <NewInventory />;
      case 'Admin Order History':
        return <OrderHistoryAdmin />;
      default:
        return <InventoryDashboard addToCart={addToCart} />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <TopNav user={user} onLogout={handleLogout} />
      <div className="main-content">
        <LeftNav setActivePage={setActivePage} isAdmin={isAdmin} />
        <div className="dashboard">
          <h1>{activePage}</h1>
          {renderPage()}
        </div>
        <RightCart cart={cart} setCart={setCart} user={user} />
      </div>
    </div>
  );
}

export default App;

