require("dotenv").config();
const db = require("./utils/db");

async function getTableSchema() {
  const connection = await db.getConnection();

  try {
    // Get all tables
    const [tables] = await connection.query(
      `
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );

    // Get schema for each table
    for (let table of tables) {
      const [columns] = await connection.query(
        `
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
        [process.env.DB_NAME, table.TABLE_NAME]
      );
      console.log(`Table: ${table.TABLE_NAME}`, columns);
    }
  } finally {
    await connection.end();
  }
}
getTableSchema();
