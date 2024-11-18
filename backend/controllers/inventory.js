const asyncHandler = require("../utils/asyncHandler");
const db = require("../utils/db");

exports.getAllInventory = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    const tag = req.query.tag || "";
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
    const minQuantity = parseInt(req.query.minQuantity) || 0;
    const sortBy = req.query.sortBy || "ProductID";
    const sortOrder =
      req.query.sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    let queryStr = `
        SELECT ProductID, ProductName, Price, ProductDescription, 
               InventoryQuantity, Tag, imageUrl
        FROM inventory
        WHERE 1=1
    `;

    let countQuery = `
        SELECT COUNT(*) as total 
        FROM inventory 
        WHERE 1=1
    `;

    const queryParams = [];

    if (search) {
      queryStr += ` AND (ProductName LIKE ? OR ProductDescription LIKE ?)`;
      countQuery += ` AND (ProductName LIKE ? OR ProductDescription LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (tag) {
      queryStr += ` AND Tag = ?`;
      countQuery += ` AND Tag = ?`;
      queryParams.push(tag);
    }

    queryStr += ` AND Price >= ? AND Price <= ?`;
    countQuery += ` AND Price >= ? AND Price <= ?`;
    queryParams.push(minPrice, maxPrice);

    if (minQuantity > 0) {
      queryStr += ` AND InventoryQuantity >= ?`;
      countQuery += ` AND InventoryQuantity >= ?`;
      queryParams.push(minQuantity);
    }

    const validSortFields = [
      "ProductID",
      "ProductName",
      "Price",
      "InventoryQuantity",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "ProductID";
    queryStr += ` ORDER BY ${sortField} ${sortOrder}`;

    queryStr += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [countResult] = await db.query(countQuery, queryParams.slice(0, -2));
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    const [inventory] = await db.query(queryStr, queryParams);

    const [tags] = await db.query(
      "SELECT DISTINCT Tag FROM inventory WHERE Tag IS NOT NULL"
    );

    const [priceRange] = await db.query(`
      SELECT 
        MIN(Price) as minPrice,
        MAX(Price) as maxPrice,
        MIN(InventoryQuantity) as minQuantity,
        MAX(InventoryQuantity) as maxQuantity
      FROM inventory
    `);

    res.json({
      inventory,
      tags: tags.map((t) => t.Tag).filter(Boolean),
      priceRange: priceRange[0],
      pagination: {
        total,
        page,
        totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
      },
      filters: {
        search,
        tag,
        minPrice,
        maxPrice,
        minQuantity,
        sortBy: sortField,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Get inventory error:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});
exports.createInventory = asyncHandler(async (req, res) => {
  try {
    const {
      productName,
      price,
      productDescription,
      inventoryQuantity,
      tag,
      imageUrl,
    } = req.body;
    if (!productName || !price || !inventoryQuantity) {
      return res.status(400).json({
        error: "Product name, price, and quantity are required",
      });
    }
    if (price < 0 || inventoryQuantity < 0) {
      return res.status(400).json({
        error: "Price and quantity must be positive numbers",
      });
    }
    const [maxIdResult] = await db.query(
      "SELECT MAX(ProductID) as maxId FROM inventory"
    );
    const nextProductId = (maxIdResult[0].maxId || 0) + 1;
    await db.query(
      `INSERT INTO inventory (
            ProductID,
            ProductName, 
            Price, 
            ProductDescription, 
            InventoryQuantity, 
            Tag, 
            imageUrl
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nextProductId,
        productName,
        price,
        productDescription || null,
        inventoryQuantity,
        tag || null,
        imageUrl || null,
      ]
    );
    const [newProduct] = await db.query(
      "SELECT * FROM inventory WHERE ProductID = ?",
      [nextProductId]
    );
    await db.query(
      `INSERT INTO inventory_log (
            ProductID,
            ChangeType,
            OldQuantity,
            NewQuantity,
            ChangedBy
          ) VALUES (?, ?, ?, ?, ?)`,
      [nextProductId, "CREATE", 0, inventoryQuantity, req.user.username]
    );

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct[0],
    });
  } catch (error) {
    console.error("Create inventory error:", error);
    res.status(500).json({
      error: "Failed to create product",
    });
  }
});
exports.deleteInventory = asyncHandler(async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const { productId } = req.params;
    const [product] = await connection.query(
      "SELECT * FROM inventory WHERE ProductID = ?",
      [productId]
    );
    if (product.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        error: "Product not found",
      });
    }
    const [orderItems] = await connection.query(
      "SELECT * FROM order_items WHERE ProductID = ? LIMIT 1",
      [productId]
    );
    if (orderItems.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        error:
          "Cannot delete product that has been ordered. Consider updating inventory quantity to 0 instead.",
      });
    }
    await connection.query("DELETE FROM inventory_log WHERE ProductID = ?", [
      productId,
    ]);
    await connection.query("DELETE FROM low_stock_alerts WHERE ProductID = ?", [
      productId,
    ]);
    await connection.query("DELETE FROM inventory WHERE ProductID = ?", [
      productId,
    ]);
    await connection.commit();
    res.json({
      message: "Product deleted successfully",
      deletedProduct: product[0],
    });
  } catch (error) {
    await connection.rollback();
    console.error("Delete inventory error:", error);
    res.status(500).json({
      error: "Failed to delete product",
    });
  } finally {
    connection.release();
  }
});
exports.updateInventory = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      productName,
      price,
      productDescription,
      inventoryQuantity,
      tag,
      imageUrl,
    } = req.body;
    const [existingProduct] = await db.query(
      "SELECT * FROM inventory WHERE ProductID = ?",
      [productId]
    );
    if (existingProduct.length === 0) {
      return res.status(404).json({
        error: "Product not found",
      });
    }
    const oldProduct = existingProduct[0];
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        error: "Price must be a positive number",
      });
    }
    if (inventoryQuantity !== undefined && inventoryQuantity < 0) {
      return res.status(400).json({
        error: "Quantity must be a positive number",
      });
    }
    const updates = [];
    const values = [];
    if (productName !== undefined) {
      updates.push("ProductName = ?");
      values.push(productName);
    }
    if (price !== undefined) {
      updates.push("Price = ?");
      values.push(price);
    }
    if (productDescription !== undefined) {
      updates.push("ProductDescription = ?");
      values.push(productDescription);
    }
    if (inventoryQuantity !== undefined) {
      updates.push("InventoryQuantity = ?");
      values.push(inventoryQuantity);
    }
    if (tag !== undefined) {
      updates.push("Tag = ?");
      values.push(tag);
    }
    if (imageUrl !== undefined) {
      updates.push("imageUrl = ?");
      values.push(imageUrl);
    }
    if (updates.length === 0) {
      return res.status(400).json({
        error: "No fields to update provided",
      });
    }
    values.push(productId);
    await db.query(
      `UPDATE inventory 
         SET ${updates.join(", ")} 
         WHERE ProductID = ?`,
      values
    );
    if (inventoryQuantity !== undefined) {
      await db.query(
        `INSERT INTO inventory_log (
            ProductID,
            ChangeType,
            OldQuantity,
            NewQuantity,
            ChangedBy
          ) VALUES (?, ?, ?, ?, ?)`,
        [
          productId,
          "UPDATE",
          oldProduct.InventoryQuantity,
          inventoryQuantity,
          req.user.username,
        ]
      );
      if (inventoryQuantity <= 10) {
        await db.query(
          `INSERT INTO low_stock_alerts (
              ProductID,
              CurrentQuantity,
              IsResolved
            ) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              CurrentQuantity = ?,
              IsResolved = ?`,
          [productId, inventoryQuantity, 0, inventoryQuantity, 0]
        );
      }
    }
    const [updatedProduct] = await db.query(
      "SELECT * FROM inventory WHERE ProductID = ?",
      [productId]
    );

    res.json({
      message: "Product updated successfully",
      product: updatedProduct[0],
    });
  } catch (error) {
    console.error("Update inventory error:", error);
    res.status(500).json({
      error: "Failed to update product",
    });
  }
});
exports.getAllImages = asyncHandler(async (_, res) => {
  try {
    const [results] = await db.query(
      `SELECT 
        ProductID,
        ProductName,
        imageUrl 
       FROM inventory 
       WHERE imageUrl IS NOT NULL`
    );

    res.json({
      count: results.length,
      images: results,
    });
  } catch (error) {
    console.error("Get images error:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});
exports.getAllTags = asyncHandler(async (_, res) => {
  try {
    const [results] = await db.query(
      `SELECT DISTINCT Tag 
       FROM inventory 
       WHERE Tag IS NOT NULL 
       ORDER BY Tag`
    );

    const tags = results.map((row) => row.Tag);

    res.json({
      count: tags.length,
      tags: tags,
    });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});
