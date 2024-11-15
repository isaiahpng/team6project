import React, { useState, useEffect } from 'react';

const OrderHistoryAdmin = ({ user }) => {
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
            <table className="order-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>User ID</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Shopping Cart ID</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedOrders.map(order => (
                        <tr key={order.OrderID}>
                            <td>{order.OrderID}</td>
                            <td>{order.UserID}</td>
                            <td>{order.OrderStatus}</td>
                            <td>{new Date(order.OrderDate).toLocaleString()}</td>
                            <td>{order.ShoppingCartID}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            )}
        </div>
    );
};

export default OrderHistoryAdmin;


