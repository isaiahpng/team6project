import React, { useState } from 'react';
import './App.css';
import LoginModal from './LoginModal';

const TopNav = ({ user, onLogin, onLogout }) => {
    const [showLogin, setShowLogin] = useState(false);

    const handleLoginClick = () => {
        setShowLogin(true);
    };

    const handleCloseModal = () => {
        setShowLogin(false);
    };

    return (
        <div className="top-nav">
            <div className="search-filter">
                <input type="text" placeholder="Search items..." />
                <button>Filter</button>
            </div>
            <div className="user-info">
                {user ? (
                    <>
                        <span className="welcome-message">Welcome, {user}</span>
                        <button onClick={onLogout} className="logout-button">Logout</button>
                    </>
                ) : (
                    <button onClick={handleLoginClick} className="login-button">Login</button>
                )}
            </div>
            <LoginModal show={showLogin} onClose={handleCloseModal} onLogin={onLogin} /> {/* Pass onLogin to LoginModal */}
        </div>
    );
};

export default TopNav;


