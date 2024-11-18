import React, { useState, useEffect } from "react";
import "../App.css"; // Include CSS for the tiled background and login form
import { axios } from "../utils";

const Register = ({ setActivePage }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

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

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage("");
      await axios.post("/user/signup", {
        username,
        email,
        password,
        phoneNumber,
        firstname,
        lastname,
      });
      alert("Sign-Up successful");
      window.location.reload();
    } catch (error) {
      console.error("Signup Error:", error);
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
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Firstname"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Lastname"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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
            <input
              type="number"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit">Sign-Up</button>
          </form>
          <p className="login_clickhere">
            Already Have Account?{" "}
            <a onClick={() => setActivePage("Login")}>Click here</a> to Login
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
