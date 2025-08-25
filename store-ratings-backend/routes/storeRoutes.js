const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const { auth, roleAuth } = require("../middleware/auth");

//  Public: anyone can see stores
router.get("/", storeController.getStores);

// Only store owners or admin can create
router.post("/", auth, roleAuth(["owner", "admin"]), storeController.createStore);

//  Update store (only owner of store OR admin)
router.put("/:id", auth, async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      // admin can update any store
      return storeController.updateStore(req, res);
    }

    // check if this store belongs to current owner
    const store = await storeController.getStoreById(req.params.id);
    if (!store || store.owner_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to update this store" });
    }

    await storeController.updateStore(req, res);
  } catch (err) {
    next(err);
  }
});

// Delete store (only owner of store OR admin)
router.delete("/:id", auth, async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      return storeController.deleteStore(req, res);
    }

    const store = await storeController.getStoreById(req.params.id);
    if (!store || store.owner_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this store" });
    }

    await storeController.deleteStore(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
