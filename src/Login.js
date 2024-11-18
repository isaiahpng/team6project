import React, { useState, useEffect } from 'react';
import './App.css'; // Include CSS for the tiled background and login form

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [inventoryImages, setInventoryImages] = useState([]);

  useEffect(() => {
    // Fetch inventory images from the backend
    fetch('https://team6project.onrender.com/api/inventory')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch inventory data.');
        }
        return response.json();
      })
      .then((data) => {
        const images = data.map((item) => item.imageUrl); // Extract image URLs
        setInventoryImages(images);
      })
      .catch((error) => {
        console.error('Error fetching inventory data:', error);
      });
  }, []);

  return (
    <div className="login-container">
      <div className="tile-container">
        {inventoryImages.map((image, index) => (
          <div
            key={index}
            className="tile"
            style={{
              backgroundImage: `url(${image})`,
              animationDelay: `${(index % 10) * 0.5}s`,
            }}
          />
        ))}
      </div>
      <div className="login-overlay">
        <div className="login-form">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setErrorMessage('');

              // Handle login here (API call and validation)
              fetch('https://team6project.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
              })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error('Invalid credentials.');
                  }
                  return response.json();
                })
                .then((user) => {
                  console.log('Login successful', user);
                  onLogin(user);
                })
                .catch((error) => {
                  console.error(error);
                  setErrorMessage('Invalid login credentials.');
                });
            }}
          >
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
