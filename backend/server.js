// Required modules
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');
require('dotenv').config(); // Load environment variables from .env file

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001; // Use environment variable or default to 3001

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true,
    },
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

// WebSocket setup
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Function to create a notification
const createNotification = (userId, message) => {
    const query = 'INSERT INTO notifications (UserID, Message) VALUES (?, ?)';
    db.query(query, [userId, message], (err, results) => {
        if (err) {
            console.error('Error creating notification:', err.stack);
            return;
        }
        console.log('Notification created with ID:', results.insertId);
        
        // Notify the user via WebSocket
        notifyClients(userId, message);
    });
};

// Function to notify clients
function notifyClients(userId, message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ userId, message }));
        }
    });
}

// Route to fetch notifications for a user
app.get('/api/notifications/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT * FROM notifications WHERE UserID = ? ORDER BY CreatedAt DESC';
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching notifications:', err.stack);
            return res.status(500).json({ message: 'Error fetching notifications' });
        }
        res.json(results);
    });
});

// Function to check inventory levels and send notifications for low stock
async function checkLowStock() {
    const lowStockThreshold = 10; // Define your low stock threshold
    const query = `
        SELECT ProductID, ProductName, InventoryQuantity 
        FROM inventory 
        WHERE InventoryQuantity < ?
    `;

    try {
        const [lowStockItems] = await db.execute(query, [lowStockThreshold]);

        for (const item of lowStockItems) {
            const notificationMessage = `Low stock alert: ${item.ProductName} (ID: ${item.ProductID}) - Only ${item.InventoryQuantity} left.`;
            await db.execute(`
                INSERT INTO notifications (UserID, Message, IsRead)
                VALUES (?, ?, ?)
            `, [null, notificationMessage, false]); // Assuming UserID is null for admin notifications
        }
    } catch (error) {
        console.error('Error checking low stock:', error);
    }
}

// Call the checkLowStock function periodically
setInterval(checkLowStock, 3600000); // Check every hour (3600000 ms)

// Customer Order History Query
app.get('/api/customer/order-history/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const query = `
            SELECT 
                o.OrderID,
                o.OrderDate,
                i.ProductName,
                oi.Quantity,
                i.Price,
                (oi.Quantity * i.Price) as SubTotal,
                o.OrderStatus
            FROM orders o
            JOIN order_items oi ON o.OrderID = oi.OrderID
            JOIN inventory i ON oi.ProductID = i.ProductID
            WHERE o.UserID = ?
            ORDER BY o.OrderDate DESC
        `;

        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error fetching customer order history:', err.stack);
                res.status(500).json({ message: 'Error fetching order history' });
                return;
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Order History Report
app.get('/api/admin/order-report', (req, res) => {
    const query = `
        SELECT 
            o.OrderID,
            u.UserName as CustomerName,
            o.OrderDate,
            GROUP_CONCAT(i.ProductName) as Products,
            SUM(oi.Quantity * i.Price) as TotalAmount,
            o.OrderStatus
        FROM orders o
        JOIN users u ON o.UserID = u.UserID
        JOIN order_items oi ON o.OrderID = oi.OrderID
        JOIN inventory i ON oi.ProductID = i.ProductID
        GROUP BY o.OrderID
        ORDER BY o.OrderDate DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching admin order report:', err.stack);
            res.status(500).json({ message: 'Error fetching order report' });
            return;
        }
        res.json(results);
    });
});

// Add filtering capabilities for admin report
app.get('/api/admin/order-report/filtered', (req, res) => {
    const { startDate, endDate, customerName } = req.query;
    
    let query = `
        SELECT 
            o.OrderID,
            u.UserName as CustomerName,
            o.OrderDate,
            GROUP_CONCAT(i.ProductName) as Products,
            SUM(oi.Quantity * i.Price) as TotalAmount,
            o.OrderStatus
        FROM orders o
        JOIN users u ON o.UserID = u.UserID
        JOIN order_items oi ON o.OrderID = oi.OrderID
        JOIN inventory i ON oi.ProductID = i.ProductID
        WHERE 1=1
    `;

    const params = [];

    if (startDate) {
        query += ` AND o.OrderDate >= ?`;
        params.push(startDate);
    }
    if (endDate) {
        query += ` AND o.OrderDate <= ?`;
        params.push(endDate);
    }
    if (customerName) {
        query += ` AND u.UserName LIKE ?`;
        params.push(`%${customerName}%`);
    }

    query += ` GROUP BY o.OrderID ORDER BY o.OrderDate DESC`;

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error fetching filtered order report:', err.stack);
            res.status(500).json({ message: 'Error fetching filtered order report' });
            return;
        }
        res.json(results);
    });
});

// Get order statistics
app.get('/api/admin/order-stats', async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(DISTINCT o.OrderID) as TotalOrders,
                COUNT(DISTINCT o.UserID) as UniqueCustomers,
                SUM(oi.Quantity * i.Price) as TotalRevenue,
                AVG(oi.Quantity * i.Price) as AverageOrderValue
            FROM orders o
            JOIN order_items oi ON o.OrderID = oi.OrderID
            JOIN inventory i ON oi.ProductID = i.ProductID
        `;

        const [stats] = await db.execute(query);
        res.json(stats[0]);
    } catch (error) {
        console.error('Error fetching order statistics:', error);
        res.status(500).json({ message: 'Error fetching order statistics' });
    }
});

// Payment endpoints
app.post('/api/payments', async (req, res) => {
    try {
        const {
            PaymentType,
            PaymentAmount,
            totalDiscount,
            FinalAmount,
            OrderID,
            CustomerID,
            DiscountID
        } = req.body;

        const query = `
            INSERT INTO payments (
                PaymentType, 
                PaymentAmount, 
                TotalDiscount, 
                FinalAmount, 
                PaymentDate,
                OrderID, 
                CustomerID, 
                DiscountID
            ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)
        `;

        db.query(
            query, 
            [PaymentType, PaymentAmount, totalDiscount, FinalAmount, OrderID, CustomerID, DiscountID],
            (err, results) => {
                if (err) {
                    console.error('Error creating payment:', err);
                    return res.status(500).json({ message: 'Error creating payment' });
                }
                res.status(201).json({ 
                    message: 'Payment created successfully',
                    paymentId: results.insertId 
                });
            }
        );
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Loyalty Program Logic
app.post('/api/purchase', async (req, res) => {
    const { customerId, amount } = req.body;

    try {
        // Calculate points earned (e.g., 1 point per dollar spent)
        const pointsEarned = Math.floor(amount); // Adjust the calculation as needed

        // Update customer's total points
        await db.execute(`
            UPDATE customers 
            SET total_points = total_points + ?
            WHERE CustomerID = ?
        `, [pointsEarned, customerId]);

        // Assign loyalty tier based on total points
        await assignLoyaltyTier(customerId);

        res.status(201).json({ message: 'Purchase recorded and points earned', pointsEarned });
    } catch (error) {
        console.error('Error processing purchase:', error);
        res.status(500).json({ message: 'Error processing purchase' });
    }
});

// Function to assign loyalty tier based on total points
async function assignLoyaltyTier(customerId) {
    const [customer] = await db.execute(`
        SELECT total_points FROM customers WHERE CustomerID = ?
    `, [customerId]);

    let tierName = 'Silver'; // Default tier
    const totalPoints = customer.total_points;

    if (totalPoints >= 1000) {
        tierName = 'Platinum';
    } else if (totalPoints >= 500) {
        tierName = 'Gold';
    }

    // Update the customer's loyalty tier
    await db.execute(`
        UPDATE customers 
        SET LoyaltyTier = ?
        WHERE CustomerID = ?
    `, [tierName, customerId]);
}

// Redeem Points
app.post('/api/redeem', async (req, res) => {
    const { customerId, pointsToRedeem, rewardDescription } = req.body;

    try {
        // Check if the customer has enough points
        const [customer] = await db.execute(`
            SELECT total_points, LoyaltyTier FROM customers WHERE CustomerID = ?
        `, [customerId]);

        if (customer.total_points < pointsToRedeem) {
            return res.status(400).json({ message: 'Not enough loyalty points' });
        }

        // Deduct points from the customer's account
        await db.execute(`
            UPDATE customers 
            SET total_points = total_points - ?
            WHERE CustomerID = ?
        `, [pointsToRedeem, customerId]);

        // Record the redemption
        await db.execute(`
            INSERT INTO redemptions (CustomerID, PointsRedeemed, RewardDescription)
            VALUES (?, ?, ?)
        `, [customerId, pointsToRedeem, rewardDescription]);

        // Apply discount based on loyalty tier
        const [tier] = await db.execute(`
            SELECT DiscountRate FROM loyalty_tiers WHERE TierName = ?
        `, [customer.LoyaltyTier]);

        const discountAmount = (pointsToRedeem * tier.DiscountRate) / 100; // Calculate discount based on points redeemed
        res.status(201).json({ message: 'Points redeemed successfully', discountAmount });
    } catch (error) {
        console.error('Error processing redemption:', error);
        res.status(500).json({ message: 'Error processing redemption' });
    }
});

// Add Item to Shopping Cart
app.post('/api/cart/add', async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        const query = `
            INSERT INTO shoppingcartitems (UserID, ProductID, Quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE Quantity = Quantity + ?;
        `;
        await db.execute(query, [userId, productId, quantity, quantity]);
        res.status(201).json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ message: 'Error adding item to cart' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 
