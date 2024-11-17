// server.js
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: '2024team6ds.mysql.database.azure.com',
  user: 'serverAdminStepan',
  password: 'mySQL4DS!',
  database: 'mydb',
  ssl: {
    rejectUnauthorized: true,
  },
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to MySQL database!');
});

// Route to get user ID by username
app.get('/api/getUserId', (req, res) => {
  const { username } = req.query;
  const query = 'SELECT UserID FROM users WHERE UserName = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error fetching UserID:', err.stack);
      return res.status(500).json({ message: 'Error fetching UserID' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ UserID: results[0].UserID });
  });
});

// Route to get or generate a ShoppingCartID
app.get('/api/getShoppingCartId', (req, res) => {
  const { userId } = req.query;
  const query = 'SELECT MAX(ShoppingCartID) AS ShoppingCartID FROM orders WHERE UserID = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching ShoppingCartID:', err.stack);
      return res.status(500).json({ message: 'Error fetching ShoppingCartID' });
    }
    const ShoppingCartID = results[0].ShoppingCartID || Math.floor(Math.random() * 100000);
    res.json({ ShoppingCartID });
  });
});

// Route for placing an order and updating inventory
app.post('/api/order', (req, res) => {
  const { UserID, OrderStatus, OrderDate, ShoppingCartID, CartItems } = req.body;

  const orderQuery = `
    INSERT INTO orders (UserID, OrderStatus, OrderDate, ShoppingCartID) 
    VALUES (?, ?, ?, ?)
  `;

  db.query(orderQuery, [UserID, OrderStatus, OrderDate, ShoppingCartID], (err) => {
    if (err) {
      console.error('Error placing order:', err.stack);
      return res.status(500).json({ message: 'Error placing order' });
    }

    // Update inventory for each cart item
    const inventoryUpdates = CartItems.map((item) => {
      return new Promise((resolve, reject) => {
        const updateQuery = `
          UPDATE inventory 
          SET InventoryQuantity = InventoryQuantity - ? 
          WHERE ProductID = ? AND InventoryQuantity >= ?
        `;
        db.query(updateQuery, [1, item.ProductID, 1], (updateErr, result) => {
          if (updateErr || result.affectedRows === 0) {
            return reject(`Insufficient inventory for ProductID ${item.ProductID}`);
          }
          resolve();
        });
      });
    });

    // Resolve all inventory updates or handle failure
    Promise.all(inventoryUpdates)
      .then(() => res.status(200).json({ message: 'Order placed and inventory updated successfully.' }))
      .catch((error) => res.status(500).json({ message: error }));
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

