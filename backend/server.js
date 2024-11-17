// Required modules
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');
const { checkInventoryLevels } = require('./utils/emailService');
require('dotenv').config(); // Load environment variables from .env file

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://team6project.onrender.com'],
  credentials: true
}));
app.use(bodyParser.json());

// DB connection
let db;
function setupDatabase() {
  db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true }
  });

  // Handle connection
  db.connect(err => {
    if (err) {
      console.error('DB Connection failed:', err.stack);
      setTimeout(setupDatabase, 5000); // Retry in 5s
      return;
    }
    console.log('Connected to DB!');
  });

  // Handle errors
  db.on('error', err => {
    console.error('DB Error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Lost DB connection - reconnecting...');
      setupDatabase();
    } else {
      throw err;
    }
  });
}

setupDatabase();

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
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const query = 'SELECT * FROM notifications WHERE UserID = ? ORDER BY CreatedAt DESC';
        
        const results = await new Promise((resolve, reject) => {
            db.query(query, [userId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
        res.json(results);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ 
            message: 'Error fetching notifications',
            error: err.message 
        });
    }
});

// Function to check inventory levels and send notifications for low stock
async function checkLowStock() {
    const lowStockThreshold = 5; // Define your low stock threshold
    const query = `
        SELECT ProductID, ProductName, InventoryQuantity 
        FROM inventory 
        WHERE InventoryQuantity < ?
    `;

    try {
        const [lowStockItems] = await new Promise((resolve, reject) => {
            db.execute(query, [lowStockThreshold], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        for (const item of lowStockItems) {
            const notificationMessage = `Low stock alert: ${item.ProductName} (ID: ${item.ProductID}) - Only ${item.InventoryQuantity} left.`;
            await new Promise((resolve, reject) => {
                db.execute(`
                    INSERT INTO notifications (UserID, Message, IsRead)
                    VALUES (?, ?, ?)
                `, [null, notificationMessage, false], (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(err);
                    } else {
                        resolve(results);
                    }
                });
            }); // Assuming UserID is null for admin notifications
        }
    } catch (err) {
        console.error('Error checking low stock:', err);
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

        const results = await new Promise((resolve, reject) => {
            db.query(query, [userId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
        res.json(results);
    } catch (err) {
        console.error('Error fetching customer order history:', err);
        res.status(500).json({ 
            message: 'Error fetching order history',
            error: err.message 
        });
    }
});

// Admin Order History Report
app.get('/api/admin/order-report', async (req, res) => {
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

    try {
        const results = await new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
        res.json(results);
    } catch (err) {
        console.error('Error fetching admin order report:', err);
        res.status(500).json({ 
            message: 'Error fetching order report',
            error: err.message 
        });
    }
});

// Add filtering capabilities for admin report
app.get('/api/admin/order-report/filtered', async (req, res) => {
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

    try {
        const results = await new Promise((resolve, reject) => {
            db.query(query, params, (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
        res.json(results);
    } catch (err) {
        console.error('Error fetching filtered order report:', err);
        res.status(500).json({ 
            message: 'Error fetching filtered order report',
            error: err.message 
        });
    }
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

        const [stats] = await new Promise((resolve, reject) => {
            db.execute(query, (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
        res.json(stats[0]);
    } catch (err) {
        console.error('Error fetching order statistics:', err);
        res.status(500).json({ 
            message: 'Error fetching order statistics',
            error: err.message 
        });
    }
});

// Payment endpoint
app.post('/api/payment', async (req, res) => {
  const { userId, amount, paymentDetails } = req.body;

  try {
    // In a real application, you would integrate with a payment processor here
    // For now, we'll just store the payment record in our database
    
    // First, create a payment record
    const paymentQuery = `
      INSERT INTO Payments (
        UserID,
        Amount,
        PaymentDate,
        PaymentStatus,
        LastFourDigits
      ) VALUES (?, ?, NOW(), 'completed', ?)
    `;

    const lastFourDigits = paymentDetails.cardNumber.replace(/\s/g, '').slice(-4);
    
    db.query(
      paymentQuery,
      [userId, amount, lastFourDigits],
      (error, results) => {
        if (error) {
          console.error('Error creating payment record:', error);
          res.status(500).json({ error: 'Failed to process payment' });
          return;
        }

        // Create a billing record
        const billingQuery = `
          INSERT INTO BillingAddresses (
            UserID,
            PaymentID,
            Address,
            City,
            State,
            ZipCode
          ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
          billingQuery,
          [
            userId,
            results.insertId,
            paymentDetails.billingAddress,
            paymentDetails.city,
            paymentDetails.state,
            paymentDetails.zipCode
          ],
          (billingError) => {
            if (billingError) {
              console.error('Error creating billing record:', billingError);
              // Note: Payment was still successful, so we'll still return success
            }

            res.json({
              success: true,
              paymentId: results.insertId,
              message: 'Payment processed successfully'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
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

        const result = await new Promise((resolve, reject) => {
            db.query(
                query, 
                [PaymentType, PaymentAmount, totalDiscount, FinalAmount, OrderID, CustomerID, DiscountID],
                (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }
            );
        });

        res.status(201).json({ 
            message: 'Payment created successfully',
            paymentId: result.insertId 
        });
    } catch (err) {
        console.error('Error creating payment:', err);
        res.status(500).json({ 
            message: 'Error creating payment',
            error: err.message 
        });
    }
});

// Loyalty Program Logic
app.post('/api/purchase', async (req, res) => {
    const { customerId, amount } = req.body;

    try {
        // Calculate points earned (e.g., 1 point per dollar spent)
        const pointsEarned = Math.floor(amount); // Adjust the calculation as needed

        // Update customer's total points
        await new Promise((resolve, reject) => {
            db.execute(`
                UPDATE customers 
                SET total_points = total_points + ?
                WHERE CustomerID = ?
            `, [pointsEarned, customerId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        // Assign loyalty tier based on total points
        await assignLoyaltyTier(customerId);

        res.status(201).json({ message: 'Purchase recorded and points earned', pointsEarned });
    } catch (err) {
        console.error('Error processing purchase:', err);
        res.status(500).json({ 
            message: 'Error processing purchase',
            error: err.message 
        });
    }
});

// Function to assign loyalty tier based on total points
async function assignLoyaltyTier(customerId) {
    const [customer] = await new Promise((resolve, reject) => {
        db.execute(`
            SELECT total_points FROM customers WHERE CustomerID = ?
        `, [customerId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });

    let tierName = 'Silver'; // Default tier
    const totalPoints = customer.total_points;

    if (totalPoints >= 1000) {
        tierName = 'Platinum';
    } else if (totalPoints >= 500) {
        tierName = 'Gold';
    }

    // Update the customer's loyalty tier
    await new Promise((resolve, reject) => {
        db.execute(`
            UPDATE customers 
            SET LoyaltyTier = ?
            WHERE CustomerID = ?
        `, [tierName, customerId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Redeem Points
app.post('/api/redeem', async (req, res) => {
    const { customerId, pointsToRedeem, rewardDescription } = req.body;

    try {
        // Check if the customer has enough points
        const [customer] = await new Promise((resolve, reject) => {
            db.execute(`
                SELECT total_points, LoyaltyTier FROM customers WHERE CustomerID = ?
            `, [customerId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        if (customer.total_points < pointsToRedeem) {
            return res.status(400).json({ message: 'Not enough loyalty points' });
        }

        // Deduct points from the customer's account
        await new Promise((resolve, reject) => {
            db.execute(`
                UPDATE customers 
                SET total_points = total_points - ?
                WHERE CustomerID = ?
            `, [pointsToRedeem, customerId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        // Record the redemption
        await new Promise((resolve, reject) => {
            db.execute(`
                INSERT INTO redemptions (CustomerID, PointsRedeemed, RewardDescription)
                VALUES (?, ?, ?)
            `, [customerId, pointsToRedeem, rewardDescription], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        // Apply discount based on loyalty tier
        const [tier] = await new Promise((resolve, reject) => {
            db.execute(`
                SELECT DiscountRate FROM loyalty_tiers WHERE TierName = ?
            `, [customer.LoyaltyTier], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        const discountAmount = (pointsToRedeem * tier.DiscountRate) / 100; // Calculate discount based on points redeemed
        res.status(201).json({ message: 'Points redeemed successfully', discountAmount });
    } catch (err) {
        console.error('Error processing redemption:', err);
        res.status(500).json({ 
            message: 'Error processing redemption',
            error: err.message 
        });
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
        await new Promise((resolve, reject) => {
            db.execute(query, [userId, productId, quantity, quantity], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
        res.status(201).json({ message: 'Item added to cart successfully' });
    } catch (err) {
        console.error('Error adding item to cart:', err);
        res.status(500).json({ 
            message: 'Error adding item to cart',
            error: err.message 
        });
    }
});

// New route for placing an order and updating inventory
app.post('/api/order', async (req, res) => {
  const cartItems = req.body;
  const lowStockItems = [];

  try {
    for (const item of cartItems) {
      await new Promise((resolve, reject) => {
        const sql = 'UPDATE inventory SET InventoryQuantity = InventoryQuantity - 1 WHERE ProductID = ?';
        db.query(sql, [item.ProductID], async (err, result) => {
          if (err) {
            console.error(`Error updating inventory for ProductID ${item.ProductID}:`, err.stack);
            reject(err);
            return;
          }

          // Check if item is now low in stock
          const checkSql = 'SELECT * FROM inventory WHERE ProductID = ? AND InventoryQuantity <= 5';
          db.query(checkSql, [item.ProductID], (checkErr, checkResult) => {
            if (checkErr) {
              console.error('Error checking inventory level:', checkErr);
            } else if (checkResult.length > 0) {
              lowStockItems.push(checkResult[0]);
            }
            resolve();
          });
        });
      });
    }

    // Send notifications for low stock items
    for (const item of lowStockItems) {
      await sendLowStockNotification(item);
    }

    res.status(200).send('Order placed and inventory updated successfully.');
  } catch (err) {
    console.error('Error updating inventory:', err);
    res.status(500).send('Error placing order.');
  }
});

// Update inventory item
app.put('/api/inventory/:id', async (req, res) => {
  const productId = req.params.id;
  const { ProductName, ProductDescription, InventoryQuantity, Price, Tag } = req.body;

  // Validate input
  if (!ProductName?.trim()) {
    return res.status(400).json({ message: 'Product name required' });
  }

  const quantity = Number(InventoryQuantity);
  const price = Number(Price);

  if (isNaN(quantity) || quantity < 0) {
    return res.status(400).json({ message: 'Valid quantity required' });
  }

  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ message: 'Valid price required' });
  }

  try {
    // First check if the item exists
    const checkQuery = 'SELECT * FROM inventory WHERE ProductID = ?';
    const exists = await new Promise((resolve, reject) => {
      db.query(checkQuery, [productId], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          resolve(results.length > 0);
        }
      });
    });

    if (!exists) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update the item
    const updateQuery = `
      UPDATE inventory 
      SET ProductName = ?, 
          ProductDescription = ?, 
          InventoryQuantity = ?, 
          Price = ?, 
          Tag = ?
      WHERE ProductID = ?
    `;

    await new Promise((resolve, reject) => {
      db.query(
        updateQuery, 
        [ProductName, ProductDescription || '', quantity, price, Tag || '', productId],
        (err, result) => {
          if (err) {
            console.error('Database error:', err);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });

    res.status(200).json({ 
      message: 'Item updated successfully',
      productId: productId
    });
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ 
      message: 'Error updating inventory item',
      error: err.message 
    });
  }
});

// Route to delete inventory item
app.delete('/api/inventory/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    // First check if the item exists
    const checkQuery = 'SELECT * FROM inventory WHERE ProductID = ?';
    const itemExists = await new Promise((resolve, reject) => {
      db.query(checkQuery, [productId], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          resolve(results.length > 0);
        }
      });
    });

    if (!itemExists) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Delete the item
    const deleteQuery = 'DELETE FROM inventory WHERE ProductID = ?';
    await new Promise((resolve, reject) => {
      db.query(deleteQuery, [productId], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    res.status(200).json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ 
      message: 'Error deleting inventory item',
      error: err.message 
    });
  }
});

// Route to add new inventory item
app.post('/api/add-inventory', async (req, res) => {
  const { ProductName, ProductDescription, InventoryQuantity, Price, Tag, imageUrl } = req.body;

  // Validate input
  if (!ProductName?.trim()) {
    return res.status(400).json({ message: 'Product name required' });
  }

  const quantity = Number(InventoryQuantity);
  const price = Number(Price);

  if (isNaN(quantity) || quantity < 0) {
    return res.status(400).json({ message: 'Valid quantity required' });
  }

  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ message: 'Valid price required' });
  }

  try {
    const query = `
      INSERT INTO inventory 
      (ProductName, ProductDescription, InventoryQuantity, Price, Tag, imageUrl) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await new Promise((resolve, reject) => {
      db.query(
        query, 
        [ProductName, ProductDescription || '', quantity, price, Tag || '', imageUrl || ''],
        (err, result) => {
          if (err) {
            console.error('Database error:', err);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });

    res.status(201).json({ 
      message: 'Item added successfully',
      productId: result.insertId 
    });
  } catch (err) {
    console.error('Error adding inventory item:', err);
    res.status(500).json({ 
      message: 'Error adding inventory item',
      error: err.message 
    });
  }
});

// Get all inventory items
app.get('/api/inventory', async (req, res) => {
  try {
    const query = 'SELECT * FROM inventory';
    await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          res.status(200).json(results);
          resolve();
        }
      });
    });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ 
      message: 'Error fetching inventory',
      error: err.message 
    });
  }
});

// Delete inventory item
app.delete('/api/inventory/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    // First check if the item exists
    const checkQuery = 'SELECT * FROM inventory WHERE ProductID = ?';
    const exists = await new Promise((resolve, reject) => {
      db.query(checkQuery, [productId], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          resolve(results.length > 0);
        }
      });
    });

    if (!exists) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Delete the item
    const deleteQuery = 'DELETE FROM inventory WHERE ProductID = ?';
    await new Promise((resolve, reject) => {
      db.query(deleteQuery, [productId], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    res.status(200).json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ 
      message: 'Error deleting inventory item',
      error: err.message 
    });
  }
});

// Function to send low stock notification
async function sendLowStockNotification(item) {
  const notificationMessage = `Low stock alert: ${item.ProductName} (ID: ${item.ProductID}) - Only ${item.InventoryQuantity} left.`;
  await new Promise((resolve, reject) => {
    db.execute(`
      INSERT INTO notifications (UserID, Message, IsRead)
      VALUES (?, ?, ?)
    `, [null, notificationMessage, false], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  }); // Assuming UserID is null for admin notifications
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
