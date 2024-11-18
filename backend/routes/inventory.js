const express = require("express");
const {
  getAllInventory,
  createInventory,
  deleteInventory,
  updateInventory,
  getAllImages,
  getAllTags,
} = require("../controllers/inventory");
const authMiddleware = require("../utils/auth");

const router = express.Router({ mergeParams: true });

router.route("/").get(getAllInventory).post(authMiddleware, createInventory);
router.route("/images").get(getAllImages);
router.route("/tag").get(getAllTags);
router
  .route("/:productId")
  .delete(authMiddleware, deleteInventory)
  .put(authMiddleware, updateInventory);

module.exports = router;
