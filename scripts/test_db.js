const pool = require("../src/config/db");

async function testDB() {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT NOW() AS current_time;");
    console.log("✅ Database Connection Successful!");
    console.log("📅 Current Timestamp from DB:", res.rows[0].current_time);
    client.release();
  } catch (err) {
    console.error("❌ Database Connection Failed!", err);
  } finally {
    pool.end();
  }
}

testDB();
