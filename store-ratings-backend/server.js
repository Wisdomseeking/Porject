const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const pool = require("./db"); 
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

const authRoutes = require('./routes/login');

app.use('/api/auth', authRoutes);

const ownerRoutes = require("./routes/storeOwnerRoutes")
app.use("/api/owner", ownerRoutes);

const userRoutes = require("./routes/userRoutes");   
app.use("/api/users", userRoutes); 

// ---------------- Signup Route ----------------
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, address, password, role } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );
    if (existingUser.rows.length) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    const result = await pool.query(
      "INSERT INTO users (name,email,address,password,role) VALUES ($1,$2,$3,$4,$5) RETURNING id,name,email,address,role",
      [name, email, address, hashedPassword, role]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ---------------- Login Route ----------------
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (!userResult.rows.length) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
    };

    res.json(userData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ---------------- User Profile Routes ----------------
// Get user profile
app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, name, email, address, role FROM users WHERE id=$1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update user profile
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, address, password } = req.body;

  try {
    let updateQuery, values;

    if (password) {
      const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      updateQuery = "UPDATE users SET name=$1, email=$2, address=$3, password=$4 WHERE id=$5 RETURNING id,name,email,address,role";
      values = [name, email, address, hashedPassword, id];
    } else {
      updateQuery = "UPDATE users SET name=$1, email=$2, address=$3 WHERE id=$4 RETURNING id,name,email,address,role";
      values = [name, email, address, id];
    }

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete user profile
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id=$1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ---------------- Stores Routes (with owner logic) ----------------

// Get all stores (public)
app.get("/api/stores", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT s.*, u.name as owner_name, u.email as owner_email FROM stores s JOIN users u ON s.owner_id = u.id ORDER BY s.id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get stores by owner
app.get("/api/stores/owner/:ownerId", async (req, res) => {
  const { ownerId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM stores WHERE owner_id=$1 ORDER BY id ASC",
      [ownerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Add store (only by owner or admin)
app.post("/api/stores", async (req, res) => {
  const { name, email, address, ownerId } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO stores (name,email,address,rating,owner_id) VALUES ($1,$2,$3,0,$4) RETURNING *",
      [name, email, address, ownerId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update store (only by owner or admin)
app.put("/api/stores/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, address, ownerId, role } = req.body;

  try {
    // Check if owner or admin
    const storeResult = await pool.query("SELECT * FROM stores WHERE id=$1", [id]);
    if (!storeResult.rows.length) {
      return res.status(404).json({ message: "Store not found" });
    }
    const store = storeResult.rows[0];
    if (store.owner_id !== ownerId && role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      "UPDATE stores SET name=$1, email=$2, address=$3 WHERE id=$4 RETURNING *",
      [name, email, address, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete store (only by owner or admin)
app.delete("/api/stores/:id", async (req, res) => {
  const { id } = req.params;
  const { ownerId, role } = req.body;

  try {
    const storeResult = await pool.query("SELECT * FROM stores WHERE id=$1", [id]);
    if (!storeResult.rows.length) {
      return res.status(404).json({ message: "Store not found" });
    }
    const store = storeResult.rows[0];
    if (store.owner_id !== ownerId && role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await pool.query("DELETE FROM stores WHERE id=$1", [id]);
    res.json({ message: "Store deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ---------------- Ratings Routes ----------------
// Fetch all ratings
app.get("/api/ratings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ratings");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Fetch ratings by user
app.get("/api/ratings/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM ratings WHERE user_id=$1",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Add or update rating
app.post("/api/ratings", async (req, res) => {
  const { userId, storeId, rating } = req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM ratings WHERE user_id=$1 AND store_id=$2",
      [userId, storeId]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        "UPDATE ratings SET rating=$1 WHERE user_id=$2 AND store_id=$3 RETURNING *",
        [rating, userId, storeId]
      );
    } else {
      result = await pool.query(
        "INSERT INTO ratings (user_id, store_id, rating) VALUES ($1,$2,$3) RETURNING *",
        [userId, storeId, rating]
      );
    }

    const avgResult = await pool.query(
      "SELECT AVG(rating) AS avg_rating FROM ratings WHERE store_id=$1",
      [storeId]
    );
    const avg = avgResult.rows[0].avg_rating || 0;

    await pool.query(
      "UPDATE stores SET rating=$1 WHERE id=$2",
      [avg, storeId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete rating
app.delete("/api/ratings/:userId/:storeId", async (req, res) => {
  const { userId, storeId } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM ratings WHERE user_id=$1 AND store_id=$2 RETURNING *",
      [userId, storeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Rating not found" });
    }

    const avgResult = await pool.query(
      "SELECT AVG(rating) AS avg_rating FROM ratings WHERE store_id=$1",
      [storeId]
    );
    const avg = avgResult.rows[0].avg_rating || 0;

    await pool.query(
      "UPDATE stores SET rating=$1 WHERE id=$2",
      [avg, storeId]
    );

    res.json({ message: "Rating removed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ---------------- Start Server ----------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
