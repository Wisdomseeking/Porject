const bcrypt = require("bcryptjs");
const db = require("../db");

// ✅ Get all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    const result = await db.query("SELECT id, name, email, role, address FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get a single user by ID
exports.getUserById = async (id) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, role, address FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error fetching user:", err.message);
    return null;
  }
};

// ✅ Update user (self or admin)
exports.updateUser = async (req, res) => {
  const { name, email, password, role, address } = req.body;
  const { id } = req.params;

  try {
    // Fetch existing user
    const userRes = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    let hashedPassword = userRes.rows[0].password;

    // If password is being updated → hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Only admin can update role
    const newRole =
      req.user.role === "admin" && role ? role : userRes.rows[0].role;

    const updatedUser = await db.query(
      `UPDATE users 
       SET name = $1, email = $2, password = $3, role = $4, address = $5
       WHERE id = $6 
       RETURNING id, name, email, role, address`,
      [
        name || userRes.rows[0].name,
        email || userRes.rows[0].email,
        hashedPassword,
        newRole,
        address || userRes.rows[0].address,
        id,
      ]
    );

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Change password (self only)
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user; // logged-in user

  try {
    const userRes = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRes.rows[0];

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      id,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Delete user (admin only)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM users WHERE id = $1 RETURNING *", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
