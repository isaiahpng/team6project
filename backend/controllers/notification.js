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

    const [notification] = await db.query(
      "SELECT UserID FROM Notifications WHERE NotificationID = ?",
      [notificationId]
    );

    if (!notification[0]) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification[0].UserID !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify this notification" });
    }

    await db.query(
      "UPDATE Notifications SET IsRead = 1 WHERE NotificationID = ?",
      [notificationId]
    );

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification error:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});
exports.getOwnNotifications = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const sortBy = req.query.sortBy || "CreatedAt";
    const sortOrder =
      req.query.sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const isRead =
      req.query.isRead !== undefined ? parseInt(req.query.isRead) : null;

    let whereClause = "WHERE UserID = ?";
    const queryParams = [req.user.userId];

    if (isRead !== null) {
      whereClause += " AND IsRead = ?";
      queryParams.push(isRead);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total 
       FROM Notifications 
       ${whereClause}`,
      queryParams
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    queryParams.push(limit, offset);
    const [notifications] = await db.query(
      `SELECT 
        NotificationID,
        Message,
        IsRead,
        CreatedAt
       FROM Notifications 
       ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      queryParams
    );

    const [unreadCount] = await db.query(
      `SELECT COUNT(*) as count 
       FROM Notifications 
       WHERE UserID = ? AND IsRead = 0`,
      [req.user.userId]
    );

    res.json({
      notifications,
      unreadCount: unreadCount[0].count,
      pagination: {
        total,
        page,
        totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
      },
      filters: {
        isRead: isRead,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

exports.markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  try {
    await db.query(
      "UPDATE Notifications SET IsRead = 1 WHERE UserID = ? AND IsRead = 0",
      [req.user.userId]
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications error:", error);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});
