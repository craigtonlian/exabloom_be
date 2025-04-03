# Exabloom Backend

## 📌 Overview

Exabloom BE is a high-performance backend system, built with Node.js and PostgreSQL, capable of efficiently managing and querying a large-scale contact and messaging database.

---

## 📂 Project Structure
```markdown
exabloom_be/
├── src/
│   ├── config/
│   │   └── db.js                 # Database connection setup
│   └── routes/
│       └── conversations.js      # Routes for retrieving recent conversations
├── scripts/
│   ├── test_db.js                # Script to test DB connection
│   ├── create_tables.js          # Script to create tables, triggers, and indexes
│   ├── populate_tables.js        # Script to populate tables with sample data
│   ├── generate_contacts.js      # Script to generate sample contact data
│   └── generate_messages.js      # Script to generate sample message data
├── data/
│   └── message_content.csv       # Sample message data
├── .env                          # Environment variables
├── .gitignore                    # Ignore node_modules, .env, etc.
├── package.json                  # Project dependencies
├── README.md                     # Documentation
└── server.js                     # Entry point for the backend server
```

---

## 🚀 Setup Instructions

### 1️⃣ Repository Setup

1. **Create a GitHub Repository**  
   - Clone the repository:
     ```sh
     git clone https://github.com/craigtonlian/exabloom_be.git
     cd exabloom_be
     ```
   - Install dependencies:
     ```sh
     npm install
     ```
2. **Set Up Environment Variables**  
   - Create a `.env` file in the root directory with the following content:
     ```env
     DB_USER=<your_postgres_user>
     DB_PASSWORD=<your_postgres_password>
     DB_HOST=localhost
     DB_NAME=exabloom_be
     DB_PORT=5432
     PORT=3000
     ```
    
---

### 2️⃣ Database Setup

#### 1. **Create the PostgreSQL Database**
   - Open PostgreSQL and create the database:
     ```sql
     CREATE DATABASE exabloom_be;
     ```

#### 2. **Test Database Connection**
   - Run the `scripts/test_db.js` script to ensure the database connection is working:
     ```sh
     node scripts/test_db.js
     ```
   - If the connection is successful, you should see a confirmation message in the terminal.

#### 3. **Create Tables & Triggers**
   - Run the following script to create the necessary tables, triggers, and indexes:
     ```sh
     node scripts/create_tables.js
     ```
   - This script will execute the following SQL commands:
     ```sql
     -- Create contacts table
     CREATE TABLE IF NOT EXISTS contacts (
         id SERIAL PRIMARY KEY,
         name VARCHAR(255) NOT NULL,
         phone_number VARCHAR(20) UNIQUE NOT NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );

     -- Create messages table
     CREATE TABLE IF NOT EXISTS messages (
         id SERIAL PRIMARY KEY,
         from_contact_id INT REFERENCES contacts(id) ON DELETE CASCADE,
         to_contact_id INT REFERENCES contacts(id) ON DELETE CASCADE,
         content TEXT NOT NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );

     -- Create trigger function to update 'updated_at' field automatically
     CREATE OR REPLACE FUNCTION update_updated_at_column()
     RETURNS TRIGGER AS $$
     BEGIN
       NEW.updated_at = CURRENT_TIMESTAMP;
       RETURN NEW;
     END;
     $$ LANGUAGE plpgsql;

     -- Create triggers to update 'updated_at' for both tables
     CREATE TRIGGER update_contacts_updated_at
       BEFORE UPDATE ON contacts
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column();

     CREATE TRIGGER update_messages_updated_at
       BEFORE UPDATE ON messages
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column();
     
     -- Create indexes for performance
     CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
     CREATE INDEX IF NOT EXISTS idx_messages_contact_ids ON messages(from_contact_id, to_contact_id);
     CREATE INDEX IF NOT EXISTS idx_messages_content ON messages USING GIN (to_tsvector('english', content));
     CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts (phone_number);
     CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts USING GIN (to_tsvector('english', name));
     ```
     
#### 4. **Generate Data for Database**
   - To generate sample data for contacts and messages, you can use the following scripts:
     - **Generate Contacts**:
       - Run the `scripts/generate_contacts.js` script to generate a `data/contacts.csv` file:
         ```sh
         node scripts/generate_contacts.js
         ```
       - This will create a `data/contacts.csv` file with sample contact data.
     - **Generate Messages**:
       - Run the `scripts/generate_messages.js` script to generate a `data/messages.csv` file:
         ```sh
         node scripts/generate_messages.js
         ```
       - This will create a `data/messages.csv` file with sample message data.

#### 5. **Populate the Database with Sample Data**
   - To import contacts and messages from CSV files, run the following script:
     ```sh
     node scripts/populate_tables.js
     ```
   - This script will execute:
     ```sql
     COPY contacts (name, phone_number)
     FROM '/absolute/path/to/data/contacts.csv'
     DELIMITER ','
     CSV;

     COPY messages (from_contact_id, to_contact_id, content, created_at)
     FROM '/absolute/path/to/data/messages.csv'
     DELIMITER ','
     CSV;
     ```

---

## 📋 System Requirements

| Requirement        | Version |
|--------------------|---------|
| **Node.js**       | `v22.14.0` |
| **PostgreSQL**    | `v15+` |

---

## ⚡ Assumptions

- **A conversation is uniquely identified by the two contact IDs involved (`from_contact_id` and `to_contact_id`).**  
- **Each contact has a unique phone number.**  
- **Messages are ordered by `created_at`, with the most recent message defining the conversation timestamp.**  
- **CSV files are used for bulk data import for scalability and performance reasons.**  
- **Indexes are created on frequently queried fields to optimize search performance.**

---

## 💡 Key Design Decisions

### 1️⃣ **Database Indexing for Performance**
- **`idx_messages_created_at`** → Optimizes queries for retrieving the most recent messages.  
- **`idx_messages_contact_ids`** → Speeds up searches for messages between two specific contacts.  
- **`idx_messages_content` (Full-Text Search Index)** → Enables efficient searching within message content.  
- **`idx_contacts_phone`** → Ensures fast lookups of contacts by phone number.  
- **`idx_contacts_name` (Full-Text Search Index)** → Allows fast searching for contacts by name.

### 2️⃣ **Use of `from_contact_id` and `to_contact_id`**
- Instead of a **single contact_id**, two fields (`from_contact_id`, `to_contact_id`) are used to uniquely **identify conversations** between contacts.
- This design enables **efficient filtering and sorting of recent conversations.**

### 3️⃣ **CSV-Based Bulk Import**
- **Why?** PostgreSQL's `COPY` command is significantly faster than `INSERT` for large datasets.
- By pre-generating contact and message data as CSV files, we optimize the initial setup process.

---
## 🎯 API Endpoints

| Method | Endpoint                          | Description                                                                 |
|--------|-----------------------------------|-----------------------------------------------------------------------------|
| `GET`  | `/api/conversations`              | Retrieve the 50 most recent conversations. Supports optional query parameters:|
|        |                                   | - `searchValue` (string): Filter conversations by contact name or phone number. |
|        |                                   | - `page` (integer): Specify the page number for pagination.                 |

## 🛠️ Running the Server
- Start the backend server with:
  ```sh
  node server.js
  ```
