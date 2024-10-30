import React, { useState } from 'react';
import './App.css';
import LoginModal from './LoginModal';

const TopNav = ({ user, onLogin, onLogout }) => {
    const [showLogin, setShowLogin] = useState(false);
    const [error, setError] = useState(null); // To store login error messages

    const handleLoginClick = () => {
        setShowLogin(true);
        setError(null); // Reset error on login attempt
    };

    const handleCloseModal = () => {
        setShowLogin(false);
    };

    const handleLogin = async (username, password) => {
        try {
            const response = await fetch('https://team6project.onrender.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed. Please check your credentials.');
            }

            const data = await response.json();
            onLogin(data.username); // Call the onLogin function passed from the parent
            handleCloseModal(); // Close the modal
        } catch (error) {
            setError(error.message); // Set error message
            console.error('Error during login:', error);
        }
    };

    return (
        <div className="top-nav">
            <div className="pos-title">
                <h1>POS System</h1> {/* Large title for POS System */}
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
            <LoginModal 
                show={showLogin} 
                onClose={handleCloseModal} 
                onLogin={handleLogin} // Pass the new handleLogin function
                error={error} // Pass error state to LoginModal if needed
            />
        </div>
    );
};

export default TopNav;
