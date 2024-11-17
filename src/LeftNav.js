// LeftNav.js
import React from 'react';
import './App.css';

const LeftNav = ({ setActivePage, isAdmin }) => {
  return (
    <div className="left-nav">
      <ul>
        <li><a onClick={() => setActivePage('Dashboard')}>Dashboard</a></li>
        <li><a onClick={() => setActivePage('Profile')}>Profile</a></li>
        {isAdmin && (
          <li><a onClick={() => setActivePage('Admin Order History')}>Order History</a></li>
        )} 
        {!isAdmin && (
          <li><a onClick={() => setActivePage('Order History')}>Order History</a></li>
        )} 
        {isAdmin && (
          <li><a onClick={() => setActivePage('Inventory')}>Inventory</a></li>
        )} 
        {isAdmin && (
          <li><a onClick={() => setActivePage('New Inventory')}>New Item</a></li>
        )} 
      </ul>
    </div>
  );
};

export default LeftNav;