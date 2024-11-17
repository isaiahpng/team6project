const express = require("express");
const {
  getAdminNotifications,
  markNotificationAsRead,
} = require("../controllers/notification");
const authMiddleware = require("../utils/auth");
const { adminOnly } = require("../utils/roleCheck");

const router = express.Router({ mergeParams: true });

router.route("/").get(authMiddleware, adminOnly, getAdminNotifications);
router
  .route("/:notificationId/read")
  .put(authMiddleware, adminOnly, markNotificationAsRead);

module.exports = router;
