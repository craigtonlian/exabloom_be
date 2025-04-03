const fs = require('fs');
const readline = require('readline');

const MESSAGES_CSV = `${__dirname}/../data/message_content.csv`;
const OUTPUT_CSV = `${__dirname}/../data/messages.csv`;

const TOTAL_MESSAGES = 5_000_000;
const BATCH_SIZE = 500_000;
const CONTACTS_SIZE = 100_000;
let messages = [];

// Load messages from CSV
let rowCount = 0;
async function loadMessages() {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(MESSAGES_CSV);
        const rl = readline.createInterface({
            input: fileStream,
        });

        rl.on('line', (line) => {
            const message = line.trim();
            if (message) {
                messages.push(message);
            }
        });

        rl.on('close', () => {
            console.log(`✅ Loaded ${messages.length} message templates.`);
            resolve();
        });

        rl.on('error', reject);
    });
}

// Generate Mock Messages CSV
async function generateMessagesCSV() {
    console.log(`🚀 Generating ${TOTAL_MESSAGES} messages into ${OUTPUT_CSV}...`);

    const stream = fs.createWriteStream(OUTPUT_CSV);
    for (let i = 1; i <= TOTAL_MESSAGES; i++) {
        // Assume contact IDs are 1 to 100,000 for fresh DB
        const fromContactId = Math.floor(Math.random() * CONTACTS_SIZE) + 1;

        let toContactId;
        do {
            toContactId = Math.floor(Math.random() * CONTACTS_SIZE) + 1;
        } while (toContactId === fromContactId); // Ensure toContactId is different from fromContactId

        const message = messages[Math.floor(Math.random() * messages.length)];
        const escapedMessage = message.replace(/"/g, '""'); // Escape double quotes
        const timestamp = new Date().toISOString();

        stream.write(`${fromContactId},${toContactId},"${escapedMessage}",${timestamp}\n`);

        if (i % BATCH_SIZE === 0) console.log(`✅ Generated ${i} messages...`);
    }

    stream.end(() => console.log("✅ Finished writing CSV!"));
}

(async () => {
    await loadMessages();
    await generateMessagesCSV();
})();
