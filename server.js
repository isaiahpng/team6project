const express = require('express');
const mysql = require('mysql');
const cors = require('cors'); 

const app = express();
const port = 3001;

// Use CORS middleware
app.use(cors());

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

// existing routes...

app.get('/api/schema', (req, res) => {
  console.log('Received request for schema');
  db.query('SHOW TABLES', (err, tables) => {
    if (err) {
      console.error('Error fetching tables:', err.stack);
      return res.status(500).send('Error fetching tables');
    }

    console.log('Tables found:', tables); // Log tables to check the structure

    const tableSchemas = [];

    const tableQueries = tables.map(table => {
      const tableName = Object.values(table)[0]; // Get the table name
      console.log('Table Name:', tableName); // Log the table name

      return new Promise((resolve) => {
        db.query(`DESCRIBE ${tableName}`, (err, schema) => {
          if (err) {
            console.error(`Error fetching schema for table ${tableName}:`, err.stack);
            return resolve(null);
          }
          tableSchemas.push({ table: tableName, schema });
          resolve();
        });
      });
    });

    Promise.all(tableQueries).then(() => {
      console.log('Schema fetched:', tableSchemas);
      res.json(tableSchemas);
    });
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});