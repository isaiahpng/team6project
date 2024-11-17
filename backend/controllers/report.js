const asyncHandler = require("../utils/asyncHandler");
const db = require("../utils/db");

// Report 1: Item Quantity and Revenue
exports.getItemQuantityAndRevenue = asyncHandler(async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    startDate = startDate || "2000-01-01";
    endDate = endDate || new Date().toISOString().split("T")[0];
    const [results] = await db.query("CALL rptItemQuantityAndRevenue(?, ?)", [
      startDate,
      endDate,
    ]);
    res.json({
      results: results[0],
      metadata: {
        startDate,
        endDate,
        reportGeneratedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Report error:", error);
    res
      .status(500)
      .json({ error: "Failed to generate item quantity and revenue report" });
  }
});

// Report 2: Customer Order History
exports.getOrderHistoryForCustomer = asyncHandler(async (req, res) => {
  try {
    const { customerId } = req.params;
    let { startDate, endDate } = req.query;
    startDate = startDate || "2000-01-01";
    endDate = endDate || new Date().toISOString().split("T")[0];
    if (!req.user.isAdmin && req.user.userId !== parseInt(customerId)) {
      return res.status(403).json({
        error: "You do not have permission to view this customer's history",
      });
    }
    const [results] = await db.query(
      "CALL rptOrderHistoryForCustomer(?, ?, ?)",
      [customerId, startDate, endDate]
    );
    res.json({
      results: results[0],
      metadata: {
        customerId,
        startDate,
        endDate,
        reportGeneratedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Report error:", error);
    res
      .status(500)
      .json({ error: "Failed to generate customer order history report" });
  }
});

// Report 3: Admin Order History
exports.getAdminOrderHistory = asyncHandler(async (req, res) => {
  try {
    const { customerId } = req.query;
    let { startDate, endDate } = req.query;
    startDate = startDate || "2000-01-01";
    endDate = endDate || new Date().toISOString().split("T")[0];
    const [results] = await db.query("CALL rptAdminOrderHistory(?, ?, ?)", [
      customerId || null,
      startDate,
      endDate,
    ]);
    res.json({
      results: results[0],
      metadata: {
        customerId: customerId || "all",
        startDate,
        endDate,
        reportGeneratedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Report error:", error);
    res
      .status(500)
      .json({ error: "Failed to generate admin order history report" });
  }
});

// Report 4: Product Sales by Month
exports.getProductSalesByMonth = asyncHandler(async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    startDate = startDate || "2000-01-01";
    endDate = endDate || new Date().toISOString().split("T")[0];
    const [results] = await db.query("CALL rptProductSalesByMonth(?, ?)", [
      startDate,
      endDate,
    ]);
    res.json({
      results: results[0],
      metadata: {
        startDate,
        endDate,
        reportGeneratedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Report error:", error);
    res.status(500).json({ error: "Failed to generate product sales report" });
  }
});

// Report 5: Items Sold by Category
exports.getItemsSoldByCategory = asyncHandler(async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    const { sortBy, sortOrder } = req.query;
    startDate = startDate || "2000-01-01";
    endDate = endDate || new Date().toISOString().split("T")[0];
    const [results] = await db.query("CALL rptItemsSoldByCategory(?, ?)", [
      startDate,
      endDate,
    ]);
    let data = results[0];
    if (sortBy && data.length > 0) {
      const validColumns = {
        "Number of Items": true,
        Category: true,
        "Gross Sales": true,
        "Unique Products": true,
        "Unique Customers": true,
        "Average Price": true,
      };
      if (validColumns[sortBy]) {
        data.sort((a, b) => {
          const aVal = a[sortBy];
          const bVal = b[sortBy];

          if (sortOrder === "desc") {
            return bVal - aVal;
          }
          return aVal - bVal;
        });
      }
    }
    res.json({
      results: data,
      metadata: {
        startDate,
        endDate,
        sortBy: sortBy || "default",
        sortOrder: sortOrder || "asc",
        reportGeneratedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Report error:", error);
    res.status(500).json({ error: "Failed to generate category sales report" });
  }
});
