import React, { useState, useEffect } from "react";
import "../App.css"; // Include CSS for the tiled background and login form
import { axios } from "../utils";

const Login = ({ setActivePage }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [inventoryImages, setInventoryImages] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get("/inventory/images");
        const images = response.data.images.map((item) => item.imageUrl); // Extract image URLs
        setInventoryImages(images);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      }
    })();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage("");
      const response = await axios.post("/user/login", {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      window.location.reload();
    } catch (error) {
      alert(error.response.data.error);
    }
  };

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
          <form onSubmit={handleLogin}>
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
          <p className="login_clickhere">
            Don't Have Account?{" "}
            <a onClick={() => setActivePage("Register")}>Click here</a> to
            Sign-up
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
