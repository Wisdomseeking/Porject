const jwt = require('jsonwebtoken');
const JWT_SECRET = "your_secret_key";

function auth(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

function roleAuth(roles) {
  return (req, res, next) => {
    const userRole = req.user.role.toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

module.exports = { auth, roleAuth };
