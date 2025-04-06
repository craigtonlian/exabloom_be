require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Wrapper for logging
async function query(sql, params) {
  const start = Date.now();
  const res = await pool.query(sql, params);
  const duration = Date.now() - start;
  console.log("Executed query", { sql, duration, rows: res.rowCount });
  return res;
}

module.exports = pool;
