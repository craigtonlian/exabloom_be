const { faker } = require('@faker-js/faker');
const fs = require('fs');

const OUTPUT_CSV = `${__dirname}/../data/contacts.csv`;
const CONTACTS_SIZE = 100_000;

console.log("📌 Generating CSV file...");

const stream = fs.createWriteStream(OUTPUT_CSV);
const generatedPhoneNumbers = new Set();

for (let i = 0; i < CONTACTS_SIZE; i++) {
    let phone;

    // Ensure phone number is unique
    do {
        phone = faker.number.int({ min: 10000000, max: 99999999 }).toString(); // 8-digit number
    } while (generatedPhoneNumbers.has(phone));

    generatedPhoneNumbers.add(phone);

    const name = faker.person.fullName();
    stream.write(`${name},${phone}\n`);
}

stream.end(() => console.log("✅ CSV file created!"));
