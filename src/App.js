import React, { useEffect, useState } from 'react';
import './App.css';
import TopNav from './TopNav';
import LeftNav from './LeftNav';
import RightCart from './RightCart';

function App() {
  return (
    <div className="app-container">
      <TopNav />
      <div className="main-content">
        <LeftNav />
        <div className="dashboard">
          {/* Dashboard content goes here */}
          <h1>Dashboard</h1>
          <p>This is where all the available merchandise will be displayed.</p>
        </div>
        <RightCart />
      </div>
    </div>
  );
}

export default App;

