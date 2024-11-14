// LeftNav.js
import React from 'react';
import './App.css';

const LeftNav = ({ setActivePage, user }) => {
  return (
    <div className="left-nav">
      <ul>
        <li><a onClick={() => setActivePage('Dashboard')}>Dashboard</a></li>
        <li><a onClick={() => setActivePage('Order History')}>Order History</a></li>
        <li><a onClick={() => setActivePage('Inventory')}>Inventory</a></li>
        <li><a onClick={() => setActivePage('New Inventory')}>New Item</a></li> {/* New Inventory link */}
      </ul>
    </div>
  );
};

export default LeftNav;


