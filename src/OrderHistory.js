import React, { useState, useEffect } from 'react';

const OrderHistory = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [sortOption, setSortOption] = useState('dateAsc'); // Default sort option

    useEffect(() => {
        if (user) {
            // Fetch order history data for the logged-in user
            fetch(`https://team6project.onrender.com/api/orders?userId=${user.UserID}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    setOrders(data);
                })
                .catch(error => {
                    console.error('Error fetching order history:', error);
                });
        }
    }, [user]); // Depend on user state to refetch on login

    // Function to sort orders based on selected option
    const sortOrders = () => {
        let sortedOrders = [...orders];
        switch (sortOption) {
            case 'dateAsc':
                sortedOrders.sort((a, b) => new Date(a.OrderDate) - new Date(b.OrderDate));
                break;
            case 'dateDesc':
                sortedOrders.sort((a, b) => new Date(b.OrderDate) - new Date(a.OrderDate));
                break;
            default:
                break;
        }
        return sortedOrders;
    };

    // Get sorted orders
    const sortedOrders = sortOrders();
    console.log("sortedOrders:", sortedOrders);

    return (
        <div className="order-history-container">
            <div className="sort-controls">
                <label htmlFor="sort">Sort by: </label>
                <select
                    id="sort"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="dateAsc">Date: Oldest to Newest</option>
                    <option value="dateDesc">Date: Newest to Oldest</option>
                </select>
            </div>

            {sortedOrders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div className="order-list">
                    {sortedOrders.map(order => (
                        <div className="order-item" key={order.OrderID}>
                            <p>Order ID: {order.OrderID}</p>
                            <p>User ID: {order.UserID}</p>
                            <p>Status: {order.OrderStatus}</p>
                            <p>Date: {new Date(order.OrderDate).toLocaleString()}</p>
                            <p>Shopping Cart ID: {order.ShoppingCartID}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;


