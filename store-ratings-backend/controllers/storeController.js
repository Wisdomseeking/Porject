const pool = require("../db");

exports.getStores = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM stores");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stores" });
  }
};

exports.getStoreById = async (id) => {
  try {
    const result = await pool.query("SELECT * FROM stores WHERE id = $1", [id]);
    return result.rows[0];
  } catch (err) {
    return null;
  }
};

exports.createStore = async (req, res) => {
  const { name, description, location } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO stores (name, description, location, owner_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, location, req.user.id] 
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create store" });
  }
};

exports.updateStore = async (req, res) => {
  const { name, description, location } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE stores SET name=$1, description=$2, location=$3 WHERE id=$4 RETURNING *",
      [name, description, location, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update store" });
  }
};

exports.deleteStore = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM stores WHERE id=$1", [id]);
    res.json({ message: "Store deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete store" });
  }
};
