const express = require("express");
const {
  getAdminOrderHistory,
  getItemQuantityAndRevenue,
  getItemsSoldByCategory,
  getOrderHistoryForCustomer,
  getProductSalesByMonth,
} = require("../controllers/report");
const authMiddleware = require("../utils/auth");
const { adminOnly } = require("../utils/roleCheck");

const router = express.Router({ mergeParams: true });

router
  .route("/quantity-revenue")
  .get(authMiddleware, adminOnly, getItemQuantityAndRevenue);
router
  .route("/sales-by-month")
  .get(authMiddleware, adminOnly, getProductSalesByMonth);
router
  .route("/category-sales")
  .get(authMiddleware, adminOnly, getItemsSoldByCategory);
router
  .route("/orders/customer/:customerId")
  .get(authMiddleware, getOrderHistoryForCustomer);
router
  .route("/orders/admin")
  .get(authMiddleware, adminOnly, getAdminOrderHistory);

module.exports = router;
