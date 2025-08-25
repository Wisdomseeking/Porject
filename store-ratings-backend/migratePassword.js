// migratePasswords.js
const bcrypt = require("bcryptjs");
const pool = require("./db"); // your PostgreSQL pool

async function migratePasswords() {
  try {
    // Fetch all users
    const users = await pool.query("SELECT id, password FROM users");

    for (let user of users.rows) {
      // Skip if already hashed (starts with $2a$ or $2b$ for bcrypt)
      if (!user.password.startsWith("$2")) {
        const hashed = bcrypt.hashSync(user.password, 10);
        await pool.query("UPDATE users SET password=$1 WHERE id=$2", [
          hashed,
          user.id,
        ]);
        console.log(`Hashed password for user ID ${user.id}`);
      }
    }

    console.log("All plain-text passwords have been hashed!");
    process.exit(0);
  } catch (err) {
    console.error("Error migrating passwords:", err);
    process.exit(1);
  }
}

migratePasswords();
