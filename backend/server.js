const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;


// Use CORS middleware
app.use(cors());
app.use(express.json()); // Add this line to parse JSON requests


const db = mysql.createConnection({
  host: '2024team6ds.mysql.database.azure.com',
  user: 'serverAdminStepan',
  password: 'mySQL4DS!',
  database: 'mydb',
  ssl: {
    rejectUnauthorized: true // This can be set to false for local development, but not recommended for production
  }
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to MySQL database!');
});

// Route to handle login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

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
    // Check if password matches (using plain-text password)
    if (user.Password === password) {
      return res.status(200).json({ username: user.UserName });
    } else {
      return res.status(401).json({ message: 'Invalid password' });
    }
  });
});

// Route to fetch inventory data
app.get('/api/inventory', (req, res) => {
  const query = 'SELECT * FROM inventory'; // Replace 'inventory' with your actual table name
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching inventory data:', err.stack);
      res.status(500).send('Error fetching inventory data');
      return;
    }
    res.json(results);
  });
});

// New route for placing an order and updating inventory
app.post('/api/order', (req, res) => {
  const cartItems = req.body; // Get cart items from the request body

  // Prepare SQL queries to update inventory quantities
  const queries = cartItems.map(item => {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE inventory SET InventoryQuantity = InventoryQuantity - 1 WHERE ProductID = ?'; // Decrement by 1
      db.query(sql, [item.ProductID], (err, result) => {
        if (err) {
          console.error(`Error updating inventory for ProductID ${item.ProductID}:`, err.stack);
          return reject(err);
        }
        resolve(result);
      });
    });
  });

  // Execute all queries
  Promise.all(queries)
    .then(() => {
      res.status(200).send('Order placed and inventory updated successfully.');
    })
    .catch(err => {
      console.error('Error updating inventory:', err);
      res.status(500).send('Error placing order.');
    });
});

//Route for inventory data
app.get('/api/inventory', async (req, res) => {
  try {
      const inventory = await db.query('SELECT * FROM inventory');
      res.json(inventory);
  } catch (error) {
      res.status(500).json({ error: 'Error fetching inventory data' });
  }
});

// Route to fetch order history data
app.get('/api/orders', (req, res) => {
  const query = 'SELECT * FROM orders'; // Adjust this to only get user's orders if needed
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
  console.log(`Server running at http://localhost:${port}`);
});

