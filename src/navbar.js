import React from 'react';
import './App.css';

function Navbar() {
  return (
    <nav className="navbar">
      <ul className="navbar-links left-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#pages">Pages</a></li>
        <li><a href="#about">About</a></li>
      </ul>
      <div className="navbar-logo">ShopLogo</div>
      <ul className="navbar-links right-links">
        <li><a href="#login">Login</a></li>
        <li><a href="#cart">Cart</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;

