const express = require('express');
const pool = require('../src/config/db');
const router = express.Router();

// Route to get conversations with pagination and search
router.get('/conversations', async (req, res) => {
    try {
        const { page = 1, searchValue = '' } = req.query;
        const limit = 50;
        const offset = (page - 1) * limit;

        const query = `
            SELECT DISTINCT ON (m.created_at, LEAST(m.from_contact_id, m.to_contact_id), GREATEST(m.from_contact_id, m.to_contact_id))
                m.from_contact_id,
                m.to_contact_id, 
                c1.name AS from_contact_name,
                c2.name AS to_contact_name,
                m.content,
                m.created_at
            FROM messages m, contacts c1, contacts c2
            WHERE m.from_contact_id = c1.id 
                AND m.to_contact_id = c2.id
                AND (c1.phone_number ILIKE $1 
                    OR c2.phone_number ILIKE $1
                    OR c1.name ILIKE $1 
                    OR c2.name ILIKE $1
                    OR m.content ILIKE $1)
            ORDER BY 
                m.created_at DESC,
                LEAST(m.from_contact_id, m.to_contact_id) ASC, 
                GREATEST(m.from_contact_id, m.to_contact_id) ASC
            LIMIT 50 OFFSET $2;
        `;

        const { rows } = await pool.query(query, [`%${searchValue}%`, offset]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
});

module.exports = router;
