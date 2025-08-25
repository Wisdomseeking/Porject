const pool = require("../db");

// Get all ratings for stores owned by this owner
exports.getOwnerRatings = async (req, res) => {
  const { ownerId } = req.params;
  try {
    const result = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, 
              u.id AS user_id, u.name AS user_name,
              s.id AS store_id, s.name AS store_name
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       JOIN stores s ON r.store_id = s.id
       WHERE s.owner_id = $1
       ORDER BY r.created_at DESC`,
      [ownerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get summary stats for stores owned by this owner
exports.getOwnerSummary = async (req, res) => {
  const { ownerId } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.id AS store_id, s.name AS store_name,
              COUNT(r.id) AS total_ratings,
              COALESCE(AVG(r.rating),0) AS avg_rating
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = $1
       GROUP BY s.id, s.name
       ORDER BY s.name`,
      [ownerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
