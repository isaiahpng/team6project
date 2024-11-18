import React, { useState, useEffect, act } from "react";
import "./App.css";
import TopNav from "./TopNav";
import LeftNav from "./LeftNav";
import RightCart from "./RightCart";
import InventoryDashboard from "./InventoryDash";
import OrderHistory from "./OrderHistory";
import Inventory from "./Inventory";
import NewInventory from "./NewInventory";
import OrderHistoryAdmin from "./OrderHistoryAdmin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { axios } from "./utils";

function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activePage, setActivePage] = useState("Login");

  const fetchCart = async (token) => {
    const response = await axios.get("/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCart(response.data);
  };

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.post(
            "/user/verify",
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUser(response.data.user);
          setIsAdmin(response.data.user.isAdmin ? true : false);
          setActivePage("Dashboard");

          await fetchCart(token);
        }
      } catch (error) {
        setUser(null);
      }
    })();
  }, []);

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setCart([]);
    setActivePage("Dashboard");
    localStorage.removeItem("token");
    window.location.reload();
  };

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <InventoryDashboard cart={cart} fetchCart={fetchCart} />;
      case "Order History":
        return <OrderHistory user={user} isAdmin={isAdmin} />;
      case "Inventory":
        return <Inventory user={user} isAdmin={isAdmin} />;
      case "New Inventory":
        return <NewInventory />;
      case "Admin Order History":
        return <OrderHistory user={user} isAdmin={isAdmin} />;
      default:
        return <InventoryDashboard cart={cart} fetchCart={fetchCart} />;
    }
  };

  if (!user) {
    return (
      <>
        {activePage === "Login" ? (
          <Login setActivePage={setActivePage} />
        ) : null}
        {activePage === "Register" ? (
          <Register setActivePage={setActivePage} />
        ) : null}
      </>
    );
  }

  return (
    <div className="app-container">
      <TopNav user={user} onLogout={handleLogout} />
      <div className="main-content">
        <LeftNav setActivePage={setActivePage} isAdmin={isAdmin} />
        <div className="dashboard">
          <h1>{activePage}</h1>
          {renderPage()}
        </div>
        <RightCart
          cart={cart}
          setCart={setCart}
          user={user}
          fetchCart={fetchCart}
        />
      </div>
    </div>
  );
}

export default App;
