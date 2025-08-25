const pool = require('./db'); // make sure path to your db.js is correct
const bcrypt = require('bcryptjs');

async function insertStoreOwner() {
  try {
    const name = "Store Owner";
    const email = "storeowner@example.com";
    const password = "password123"; // change as needed
    const address = "123 Store St";
    const role = "Store Owner";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, address, role]
    );

    console.log("Store Owner inserted:", result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error("Error inserting Store Owner:", err);
    process.exit(1);
  }
}

insertStoreOwner();
