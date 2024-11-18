import React, { useState, useEffect } from "react";
import { axios } from "./utils";
import EditInventory from "./EditInventory";

const InventoryDashboard = ({ isAdmin }) => {
  const [inventory, setInventory] = useState([]);
  const [reports, setReports] = useState([]);
  const [reports2, setReports2] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [sortOption, setSortOption] = useState("ProductID&DESC");

  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");

  const [modal, setModal] = useState(null);

  const fetchInventory = async (page = 1, initial) => {
    const by = sortOption.split("&")[0];
    const order = sortOption.split("&")[1];
    const response = await axios.get(
      `/inventory?sortBy=${by}&sortOrder=${order}&page=${page}`
    );
    setInventory((state) => {
      if (initial) {
        const copy = [...response.data.inventory];
        return copy;
      } else {
        const copy = [...state, ...response.data.inventory];
        return copy;
      }
    });
    setNextPage(response.data.pagination.nextPage);
  };
  const fetchReport = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `/report/quantity-revenue?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setReports(response.data.results);

    const response2 = await axios.get(
      `/report/sales-by-month?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setReports2(response2.data.results);
  };

  useEffect(() => {
    // Fetch inventory data from the backend
    fetchInventory(1, true);
  }, [sortOption]);

  return (
    <div>
      <h1>Report</h1>
      <div>
        <h2>Quantity And Revenue</h2>
        <div style={{ display: "flex" }}>
          <div>
            <label for="start">Start date:</label>
            <input
              type="date"
              id="start"
              name="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label for="start">End date:</label>
            <input
              type="date"
              id="end"
              name="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <button onClick={fetchReport}>Fetch</button>
          </div>
        </div>
        <div className="inventory-container">
          {reports.map((item) => (
            <div
              className="inventory-item"
              key={item.ProductID}
              onClick={() => setModal(item)}
            >
              <h3 className="product-name">{item.ProductName}</h3>
              <p className="product-price">
                Total Revenue - ${item.TotalRevenue}
              </p>
              <p className="product-price">
                TotalQuantity Sold: {item.TotalQuantitySold}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2>Sales by month</h2>
        <div className="inventory-container">
          {reports2.map((item) => (
            <div
              className="inventory-item"
              key={item.ProductID}
              onClick={() => setModal(item)}
            >
              <h3 className="product-name">{item.ProductName}</h3>
              <h3 className="product-name">{item.YearMonth}</h3>
              <p className="product-price">
                Total Revenue - ${item.TotalRevenue}
              </p>
              <p className="product-price">
                TotalQuantity Sold: {item.TotalQuantitySold}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="inventory-container">
        <div className="sort-controls">
          <label htmlFor="sort">Sort by: </label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="ProductID&DESC">Default</option>
            <option value="InventoryQuantity&ASC">Quantity: Low to High</option>
            <option value="InventoryQuantity&DESC">
              Quantity: High to Low
            </option>
            <option value="Price&ASC">Price: Low to High</option>
            <option value="Price&DESC">Price: High to Low</option>
          </select>
        </div>

        {inventory.map((item) => {
          return (
            <div
              className="inventory-item"
              key={item.ProductID}
              onClick={() => setModal(item)}
            >
              <h3 className="product-name">{item.ProductName}</h3>
              <p className="product-price">${item.Price}</p>
              <p className="product-price">
                Inventory Quantity: {item.InventoryQuantity}
              </p>
              {item.InventoryQuantity < 20 && (
                <p className="low-stock-warning" style={{ color: "red" }}>
                  Low Stock
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="center">
        {nextPage ? (
          <button className="button" onClick={() => fetchInventory(nextPage)}>
            Load more
          </button>
        ) : null}
      </div>
      {modal ? (
        <div className="modal">
          <div className="modal-overlay" onClick={() => setModal(null)}></div>
          <div className="modal-content">
            <EditInventory
              data={modal}
              onClose={() => {
                setModal(null);
                fetchInventory(1, true);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default InventoryDashboard;
