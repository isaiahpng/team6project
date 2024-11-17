const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001; // Use environment variable or default to 3001

// Use CORS middleware
app.use(cors({ origin: '*' }));
app.use(express.json()); // Add this line to parse JSON requests

const db = mysql.createConnection({
  host: '2024team6ds.mysql.database.azure.com',
  user: 'serverAdminStepan',
  password: 'mySQL4DS!',
  database: 'mydb',
  ssl: {
    rejectUnauthorized: true, // For production, true is safer; set to false for local dev if needed
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

// Route to handle login
app.post('/api/login', (req, res) => {
  const { username, password , isAdmin} = req.body;
  const query = 'SELECT * FROM users WHERE UserName = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err.stack);
      return res.status(500).json({ message: 'An error occurred' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];
    if (user.Password === password) {
      return res.status(200).json({ 
        username: user.UserName,
        isAdmin: user.isAdmin === 1,
      });
    } else {
      return res.status(401).json({ message: 'Invalid password' });
    }
  });
});

// Route to fetch inventory data
app.get('/api/inventory', (req, res) => {
  const query = 'SELECT * FROM inventory';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching inventory data:', err.stack);
      res.status(500).send('Error fetching inventory data');
      return;
    }
    res.json(results);
  });
});

// Route to add new inventory item
app.post('/api/add-inventory', (req, res) => {
  const { ProductName, ProductDescription, InventoryQuantity, Price, inventorycol, Tag, imageUrl } = req.body;

  const query = `
    INSERT INTO inventory (ProductName, ProductDescription, InventoryQuantity, Price, inventorycol, Tag, imageUrl) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [ProductName, ProductDescription, InventoryQuantity, Price, inventorycol, Tag, imageUrl], (err, results) => {
    if (err) {
      console.error('Error adding new inventory item:', err.stack);
      return res.status(500).json({ message: 'Error adding new inventory item' });
    }
    res.status(201).json({ message: 'Inventory item added successfully' });
  });
});

// New route for placing an order and updating inventory
app.post('/api/order', (req, res) => {
  const cartItems = req.body;

  const queries = cartItems.map((item) => {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE inventory SET InventoryQuantity = InventoryQuantity - 1 WHERE ProductID = ?';
      db.query(sql, [item.ProductID], (err, result) => {
        if (err) {
          console.error(`Error updating inventory for ProductID ${item.ProductID}:`, err.stack);
          return reject(err);
        }
        resolve(result);
      });
    });
  });

  Promise.all(queries)
    .then(() => {
      res.status(200).send('Order placed and inventory updated successfully.');
    })
    .catch((err) => {
      console.error('Error updating inventory:', err);
      res.status(500).send('Error placing order.');
    });
});

// Route to fetch order history data
app.get('/api/orders', (req, res) => {
  const query = 'SELECT * FROM orders';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching order history data:', err.stack);
      res.status(500).send('Error fetching order history data');
      return;
    }
    res.json(results);
  });
});

// New route to fetch the last ShoppingCartID
app.get('/api/last-shopping-cart-id', (req, res) => {
  const query = 'SELECT MAX(ShoppingCartID) AS lastShoppingCartId FROM orders';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching last ShoppingCartID:', err.stack);
      return res.status(500).json({ message: 'Error fetching last ShoppingCartID' });
    }
    res.json({ lastShoppingCartId: results[0].lastShoppingCartId || 0 });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`); // Added port info
});

// Example endpoint to get UserID
app.get('/api/getUserId', async (req, res) => {
  const { username } = req.query;
  const query = 'SELECT UserID FROM Users WHERE Username = ?';
  const [rows] = await db.execute(query, [username]);
  if (rows.length > 0) {
    res.json({ UserID: rows[0].UserID });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Example endpoint to get ShoppingCartID for a user
app.get('/api/getShoppingCartId', async (req, res) => {
  const { userId } = req.query;
  const query = 'SELECT ShoppingCartID FROM Orders WHERE UserID = ? LIMIT 1';
  const [rows] = await db.execute(query, [userId]);
  if (rows.length > 0) {
    res.json({ ShoppingCartID: rows[0].ShoppingCartID });
  } else {
    res.json({ ShoppingCartID: null }); // Return null if no existing cart ID
  }
});

app.post('/api/order', async (req, res) => {
  const { UserID, OrderStatus, OrderDate, ShoppingCartID, CartItems } = req.body;
  // Insert into Orders table without specifying OrderID
  const query = `
    INSERT INTO Orders (UserID, OrderStatus, OrderDate, ShoppingCartID)
    VALUES (?, ?, ?, ?)
  `;
  
  try {
      const [result] = await db.execute(query, [UserID, OrderStatus, OrderDate, ShoppingCartID]);
      // Retrieve the auto-generated OrderID if needed
      const generatedOrderID = result.insertId;
      // Insert each item in CartItems (optional, depending on your table structure)
      for (const item of CartItems) {
          await db.execute(`
            INSERT INTO OrderItems (OrderID, ProductID, Quantity)
            VALUES (?, ?, ?)
          `, [generatedOrderID, item.ProductID, item.Quantity]);
      }
      res.status(201).json({ message: 'Order placed successfully' });
  } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ message: 'Failed to place the order. Please try again.' });
  }
});
