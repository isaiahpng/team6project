import React, { useState } from 'react';
import './App.css';
import LoginModal from './LoginModal';
import StarIcon from '@mui/icons-material/Star';

const TopNav = ({ user, onLogin, onLogout }) => {
    const [showLogin, setShowLogin] = useState(false);

    const handleLoginClick = () => {
        setShowLogin(true);
    };

    const handleCloseModal = () => {
        setShowLogin(false);
    };

    const getLoyaltyTier = (points) => {
        if (points >= 150) return 'Platinum';
        if (points >= 100) return 'Gold';
        if (points >= 50) return 'Silver';
        return 'Bronze';
    };

    return (
        <div className="top-nav">
            <div className="pos-title">
                <h1>POS System</h1> {/* Large title for POS System */}
            </div>
            <div className="user-info">
                {user ? (
                    <>
                        <div className="loyalty-status">
                            <StarIcon sx={{ mr: 1 }} />
                            <span>{user.LoyaltyPoints || 0} points ({getLoyaltyTier(user.LoyaltyPoints || 0)})</span>
                        </div>
                        <span className="username">{user.Username}</span>
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
