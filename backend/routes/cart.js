const express = require("express");
const {
  createOrUpdateCart,
  createOrder,
  getCart,
  removeFromCart,
  updateQuantity,
} = require("../controllers/cart");
const authMiddleware = require("../utils/auth");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authMiddleware, getCart)
  .post(authMiddleware, createOrUpdateCart);
router.route("/checkout").post(authMiddleware, createOrder);

router
  .route("/items/:productId")
  .delete(authMiddleware, removeFromCart)
  .put(authMiddleware, updateQuantity);

module.exports = router;
