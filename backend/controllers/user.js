const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../utils/db");
const asyncHandler = require("../utils/asyncHandler");

exports.login = asyncHandler(async (req, res, _) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      `SELECT u.*, c.LoyaltyTier, c.TotalPoints 
       FROM users u
       LEFT JOIN customers c ON u.UserId = c.CustomerID
       WHERE u.Email = ?`,
      [email]
    );
    const user = users[0];
    if (!user) {
      return res.status(400).json({
        error: "User not found with this email",
      });
    }
    const validPassword = await bcrypt.compare(password, user.Password);
    if (!validPassword) {
      return res.status(400).json({
        error: "Invalid password",
      });
    }
    const token = jwt.sign(
      {
        userId: user.UserId,
        isAdmin: user.isAdmin,
        email: user.Email,
        username: user.UserName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );
    delete user.Password;
    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
    });
  }
});
exports.signup = asyncHandler(async (req, res, _) => {
  try {
    const { username, email, password, phoneNumber, firstName, lastName } =
      req.body;
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE Email = ? OR UserName = ?",
      [email, username]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({
        error: "User already exists with this email or username",
      });
    }
    const [maxUserResult] = await db.query(
      "SELECT MAX(UserId) as maxId FROM users"
    );
    const nextUserId = (maxUserResult[0].maxId || 0) + 1;
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (
        UserId, 
        UserName, 
        Email, 
        Password, 
        PhoneNumber, 
        isAdmin, 
        discount
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nextUserId, username, email, hashedPassword, phoneNumber, 0, 0]
    );
    await db.query(
      `INSERT INTO customers (
        CustomerID, 
        FirstName, 
        LastName, 
        LoyaltyTier, 
        TotalPoints
      ) VALUES (?, ?, ?, ?, ?)`,
      [nextUserId, firstName || null, lastName || null, "BRONZE", 0]
    );
    await db.query(
      `INSERT INTO loyalty_points (
        customerID, 
        total_points
      ) VALUES (?, ?)`,
      [nextUserId, 0]
    );
    res.status(201).json({
      message: "Registration successful",
      userId: nextUserId,
      username,
      email,
      loyaltyTier: "BRONZE",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: "Failed to create user",
    });
  }
});

exports.getAll = asyncHandler(async (req, res, _) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM users u
       WHERE u.UserName LIKE ? OR u.Email LIKE ?`,
      [`%${search}%`, `%${search}%`]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    const [users] = await db.query(
      `SELECT 
        u.UserId,
        u.UserName,
        u.Email,
        u.PhoneNumber,
        u.isAdmin,
        u.discount,
        c.FirstName,
        c.LastName,
        c.BillingAddress,
        c.ShippingAddress,
        c.LoyaltyTier,
        c.TotalPoints
      FROM users u
      LEFT JOIN customers c ON u.UserId = c.CustomerID
      WHERE u.UserName LIKE ? OR u.Email LIKE ?
      ORDER BY u.UserId
      LIMIT ? OFFSET ?`,
      [`%${search}%`, `%${search}%`, limit, offset]
    );

    res.json({
      users,
      pagination: {
        total,
        page,
        totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

exports.deleteUser = asyncHandler(async (req, res, _) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { userId } = req.params;

    const [userExists] = await connection.query(
      "SELECT UserId FROM users WHERE UserId = ?",
      [userId]
    );

    if (userExists.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "User not found" });
    }
    await connection.query("DELETE FROM customers WHERE CustomerID = ?", [
      userId,
    ]);
    await connection.query(
      "DELETE FROM virtualshoppingcart WHERE CustomerID = ?",
      [userId]
    );
    await connection.query("DELETE FROM loyalty_points WHERE customerID = ?", [
      userId,
    ]);
    await connection.query("DELETE FROM users WHERE UserId = ?", [userId]);

    await connection.commit();

    res.json({
      message: "User deleted successfully",
      deletedUserId: userId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  } finally {
    connection.release();
  }
});
exports.makeAdmin = asyncHandler(async (req, res, _) => {
  try {
    const { userId } = req.params;
    const [userExists] = await db.query(
      "SELECT UserId, isAdmin, UserName FROM users WHERE UserId = ?",
      [userId]
    );
    if (userExists.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    await db.query("UPDATE users SET isAdmin = ? WHERE UserId = ?", [
      1,
      userId,
    ]);
    res.json({
      message: `User ${userExists[0].UserName} admin status updated successfully`,
      userId,
    });
  } catch (error) {
    console.error("Make admin error:", error);
    res.status(500).json({
      error: "Failed to update admin status",
    });
  }
});
