// LeftNav.js
import React from 'react';
import './App.css';

const LeftNav = () => {
  return (
    <div className="left-nav">
      <ul>
        <li><a href="/">Dashboard</a></li>
        <li><a href="/order-history">Order History</a></li>
        <li><a href="/inventory">Inventory</a></li>
      </ul>
    </div>
  );
};

export default LeftNav;
