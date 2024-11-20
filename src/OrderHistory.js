import React, { useState, useEffect } from "react";
import { axios } from "./utils";

const OrderHistory = ({ user, isAdmin }) => {
  const [orders, setOrders] = useState([]);
  const [sortOption, setSortOption] = useState("OrderDate&DESC");

  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");

  const fetchAdminOrders = async () => {
    const token = localStorage.getItem("token");
    const by = sortOption.split("&")[0];
    const order = sortOption.split("&")[1];
    const response = await axios.get(
      `/report/orders/admin?sortBy=${by}&sortOrder=${order}&startDate=${startDate}&endDate=${endDate}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setOrders(response.data.results);
  };

  const fetchOwnOrders = async () => {
    const token = localStorage.getItem("token");
    const by = sortOption.split("&")[0];
    const order = sortOption.split("&")[1];
    const response = await axios.get(
      `/report/orders/customer/${user.UserId}?sortBy=${by}&sortOrder=${order}&startDate=${startDate}&endDate=${endDate}`,
      // `/report/orders/admin?sortBy=${by}&sortOrder=${order}&startDate=${startDate}&endDate=${endDate}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setOrders(response.data.results);
  };

  useEffect(() => {
    setOrders([]);
    if (isAdmin) {
      fetchAdminOrders();
    } else {
      fetchOwnOrders();
    }
  }, [sortOption]);

  return (
    <div className="order-history-container">
      <div className="sort-controls">
        <label htmlFor="sort">Sort by: </label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="OrderDate&DESC">Date: Newest to Oldest</option>
          <option value="OrderDate&ASC">Date: Oldest to Newest</option>
        </select>
      </div>
      <div style={{ display: "flex" }}>
        <div>
          <label htmlFor="start">Start date:</label>
          <input
            type="date"
            id="start"
            name="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="end">End date:</label>
          <input
            type="date"
            id="end"
            name="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <button onClick={isAdmin ? fetchAdminOrders : fetchOwnOrders}>
            Fetch
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="inventory-container">
          {orders.map((order) => (
            <div className="order-item" key={order.OrderID}>
              <p>Order ID: {order.OrderID}</p>
              <p>Customer ID: {order.CustomerID}</p>
              <p>Username: {order.UserName}</p> {/* Added line */}
              <p>User Email: {order.Email}</p> {/* Added line */}
              <p>Status: {order.OrderStatusText}</p>
              <p>Total: ${order.OrderTotal}</p>
              <p>Date: {new Date(order.OrderDate).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
