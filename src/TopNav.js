// TopNav.js
import React from 'react';
import './App.css';

const TopNav = () => {
  return (
    <div className="top-nav">
      <div className="search-filter">
        <input type="text" placeholder="Search food..." />
        <button>Filter</button>
      </div>
      <div className="user-info">
        {/* Replace with logic for logged-in user or login button */}
        <button>Login</button>
      </div>
    </div>
  );
};

export default TopNav;
