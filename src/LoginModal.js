import React, { useState } from 'react';
import './App.css';

const LoginModal = ({ show, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async () => {
    setErrorMessage(''); // Clear previous error message
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }), // Send username and password
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.message); // Set error message if login fails
        return;
      }

      const data = await response.json();
      onLogin(data.username); // Pass the username back to the parent component
      onClose();
    } catch (error) {
      console.error('Error logging in:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    show && (
      <div className="modal-overlay">
        <div className="login-modal">
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}
          <button onClick={handleLoginSubmit}>Login</button>
          <button className="close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    )
  );
};

export default LoginModal;


