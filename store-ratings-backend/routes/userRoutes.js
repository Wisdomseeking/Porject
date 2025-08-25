const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { auth, roleAuth } = require("../middleware/auth");

// ✅ Admin can see all users
router.get("/", auth, roleAuth(["admin"]), userController.getUsers);

// ✅ Get logged-in user's own profile
router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await userController.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// ✅ Change password (self only)  <-- move this UP
router.put("/change-password/me", auth, async (req, res, next) => {
  try {
    await userController.changePassword(req, res);
  } catch (err) {
    next(err);
  }
});

// ✅ Update profile (user can update their own, admin can update anyone)
router.put("/:id", auth, async (req, res, next) => {
  try {
    if (req.user.role !== "admin" && req.user.id != req.params.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this user" });
    }
    await userController.updateUser(req, res);
  } catch (err) {
    next(err);
  }
});

// ✅ Delete user (admin only)
router.delete("/:id", auth, roleAuth(["admin"]), userController.deleteUser);

module.exports = router;
