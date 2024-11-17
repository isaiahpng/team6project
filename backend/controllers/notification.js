const asyncHandler = require("../utils/asyncHandler");
const db = require("../utils/db");

exports.getAdminNotifications = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(
      "SELECT COUNT(*) as total FROM Notifications WHERE UserID = ?",
      [req.user.userId]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    const [notifications] = await db.query(
      `SELECT 
            NotificationID,
            Message,
            IsRead,
            CreatedAt
           FROM Notifications 
           WHERE UserID = ?
           ORDER BY CreatedAt DESC
           LIMIT ? OFFSET ?`,
      [req.user.userId, limit, offset]
    );

    res.json({
      notifications,
      pagination: {
        total,
        page,
        totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

exports.markNotificationAsRead = asyncHandler(async (req, res) => {
  try {
    const { notificationId } = req.params;

    await db.query(
      "UPDATE Notifications SET IsRead = 1 WHERE NotificationID = ? AND UserID = ?",
      [notificationId, req.user.userId]
    );

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification error:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});
