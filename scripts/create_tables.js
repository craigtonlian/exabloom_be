const pool = require('../src/config/db');

async function createTables() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create contacts table
    const createContactsTableQuery = `
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create messages table
    const createMessagesTableQuery = `
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        from_contact_id INT REFERENCES contacts(id) ON DELETE CASCADE,
        to_contact_id INT REFERENCES contacts(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create trigger function to update 'updated_at' field
    const createTriggerFunctionQuery = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Create triggers to update 'updated_at' for both tables
    const createContactsTriggerQuery = `
      CREATE TRIGGER update_contacts_updated_at
        BEFORE UPDATE ON contacts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    const createMessagesTriggerQuery = `
      CREATE TRIGGER update_messages_updated_at
        BEFORE UPDATE ON messages
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    // Created indexes for query optimization
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_contact_ids ON messages(from_contact_id, to_contact_id);
      CREATE INDEX IF NOT EXISTS idx_messages_content ON messages USING GIN (to_tsvector('english', content));
      CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts (phone_number);
      CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts USING GIN (to_tsvector('english', name));
    `;

    console.log("🚀 Creating tables, triggers, and indexes...");

    // Execute table creation
    await client.query(createContactsTableQuery);
    await client.query(createMessagesTableQuery);

    // Execute trigger function and triggers creation
    await client.query(createTriggerFunctionQuery);
    await client.query(createContactsTriggerQuery);
    await client.query(createMessagesTriggerQuery);

    // Execute index creation
    await client.query(createIndexesQuery);

    await client.query('COMMIT');
    console.log("✅ Tables, triggers, and indexes created successfully.");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Error creating tables, triggers, or indexes:", err);
  } finally {
    client.release();
    pool.end();
  }
}

createTables();
