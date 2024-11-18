const express = require("express");
const {
  getAdminNotifications,
  markNotificationAsRead,
  getOwnNotifications,
  markAllNotificationsAsRead,
} = require("../controllers/notification");
const authMiddleware = require("../utils/auth");
const { adminOnly } = require("../utils/roleCheck");

const router = express.Router({ mergeParams: true });

router.route("/admin").get(authMiddleware, adminOnly, getAdminNotifications);
router.route("/").get(authMiddleware, getOwnNotifications);
router.route("/read").put(authMiddleware, markAllNotificationsAsRead);
router
  .route("/:notificationId/read")
  .put(authMiddleware, markNotificationAsRead);

module.exports = router;
