const path = require('path');
const pool = require('../src/config/db');

async function populateDatabase() {
  const client = await pool.connect();
  try {
    console.log("🚀 Populating database with contacts and messages...");

    const contactsPath = path.resolve(__dirname, '../data/contacts.csv');
    const messagesPath = path.resolve(__dirname, '../data/messages.csv');

    console.log("⏳ Processing contacts table...");
    await client.query(`
      COPY contacts (name, phone_number)
      FROM '${contactsPath}'
      DELIMITER ','
      CSV;
    `);
    console.log("✅ Done populating contacts table...");

    console.log("⏳ Processing messages table...");
    console.log("⏳ This might take a few minutes...");
    await client.query(`
      COPY messages (from_contact_id, to_contact_id, content, created_at)
      FROM '${messagesPath}'
      DELIMITER ','
      CSV;
    `);
    console.log("✅ Done populating messages table...");

    console.log("✅ Database successfully populated!");
  } catch (err) {
    console.error("❌ Error populating database:", err);
  } finally {
    client.release();
    pool.end();
  }
}

populateDatabase();
