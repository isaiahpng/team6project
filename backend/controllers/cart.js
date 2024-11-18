const asyncHandler = require("../utils/asyncHandler");
const db = require("../utils/db");

exports.createOrUpdateCart = asyncHandler(async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    const [existingCart] = await db.query(
      'SELECT * FROM virtualshoppingcart WHERE CustomerID = ? AND Status = "ACTIVE"',
      [userId]
    );

    let cartId;

    if (existingCart.length === 0) {
      const [maxCartResult] = await db.query(
        "SELECT MAX(ShoppingCartID) as maxId FROM virtualshoppingcart"
      );
      cartId = (maxCartResult[0].maxId || 0) + 1;

      await db.query(
        `INSERT INTO virtualshoppingcart 
          (ShoppingCartID, CustomerID, Status, SumOfProducts, LastUpdate) 
          VALUES (?, ?, "ACTIVE", 0, NOW())`,
        [cartId, userId]
      );
    } else {
      cartId = existingCart[0].ShoppingCartID;
    }

    const [product] = await db.query(
      "SELECT * FROM inventory WHERE ProductID = ? AND InventoryQuantity >= ?",
      [productId, quantity]
    );

    if (product.length === 0) {
      return res
        .status(400)
        .json({ error: "Product not available in requested quantity" });
    }

    const [existingItem] = await db.query(
      "SELECT * FROM shoppingcartitems WHERE ShoppingCartID = ? AND ProductID = ?",
      [cartId, productId]
    );

    if (existingItem.length > 0) {
      await db.query(
        "UPDATE shoppingcartitems SET ProductQuantity = ProductQuantity + ? WHERE ShoppingCartID = ? AND ProductID = ?",
        [quantity, cartId, productId]
      );
    } else {
      await db.query(
        "INSERT INTO shoppingcartitems (ShoppingCartID, ProductID, ProductQuantity) VALUES (?, ?, ?)",
        [cartId, productId, quantity]
      );
    }

    await db.query(
      `UPDATE virtualshoppingcart 
         SET SumOfProducts = (
           SELECT SUM(i.Price * sci.ProductQuantity) 
           FROM shoppingcartitems sci
           JOIN inventory i ON i.ProductID = sci.ProductID
           WHERE sci.ShoppingCartID = ?
         ),
         LastUpdate = NOW()
         WHERE ShoppingCartID = ?`,
      [cartId, cartId]
    );

    const [updatedCart] = await db.query(
      `SELECT 
          vsc.ShoppingCartID,
          vsc.SumOfProducts as Total,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'productId', i.ProductID,
              'productName', i.ProductName,
              'quantity', sci.ProductQuantity,
              'price', i.Price,
              'subtotal', i.Price * sci.ProductQuantity
            )
          ) as items
         FROM virtualshoppingcart vsc
         JOIN shoppingcartitems sci ON sci.ShoppingCartID = vsc.ShoppingCartID
         JOIN inventory i ON i.ProductID = sci.ProductID
         WHERE vsc.ShoppingCartID = ?
         GROUP BY vsc.ShoppingCartID, vsc.SumOfProducts`,
      [cartId]
    );

    res.json({
      message: "Cart updated successfully",
      cart: updatedCart[0],
    });
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

exports.getCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.userId;

    const [cart] = await db.query(
      `SELECT 
            vsc.ShoppingCartID,
            vsc.SumOfProducts as Total,
            i.ProductID,
            i.ProductName,
            i.Price,
            sci.ProductQuantity,
            (i.Price * sci.ProductQuantity) as Subtotal
           FROM virtualshoppingcart vsc
           JOIN shoppingcartitems sci ON sci.ShoppingCartID = vsc.ShoppingCartID
           JOIN inventory i ON i.ProductID = sci.ProductID
           WHERE vsc.CustomerID = ? AND vsc.Status = "ACTIVE"`,
      [userId]
    );

    res.json(cart);
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ error: "Failed to get cart" });
  }
});

exports.getCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.userId;

    const [cart] = await db.query(
      `SELECT 
            vsc.ShoppingCartID,
            vsc.SumOfProducts as Total,
            i.ProductID,
            i.ProductName,
            i.Price,
            sci.ProductQuantity,
            (i.Price * sci.ProductQuantity) as Subtotal
           FROM virtualshoppingcart vsc
           JOIN shoppingcartitems sci ON sci.ShoppingCartID = vsc.ShoppingCartID
           JOIN inventory i ON i.ProductID = sci.ProductID
           WHERE vsc.CustomerID = ? AND vsc.Status = "ACTIVE"`,
      [userId]
    );

    res.json(cart);
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ error: "Failed to get cart" });
  }
});
exports.createOrder = asyncHandler(async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user.userId;
    const { paymentDetails } = req.body;

    const validPaymentTypes = ["Credit Card", "CASH", "Debit Card"];
    if (!validPaymentTypes.includes(paymentDetails.type)) {
      await connection.rollback();
      return res.status(400).json({
        error:
          "Invalid payment type. Allowed types: Credit Card, CASH, Debit Card",
      });
    }

    const [cart] = await connection.query(
      `SELECT vsc.*, 
              GROUP_CONCAT(sci.ProductID) as productIds,
              GROUP_CONCAT(sci.ProductQuantity) as quantities
       FROM virtualshoppingcart vsc
       LEFT JOIN shoppingcartitems sci ON vsc.ShoppingCartID = sci.ShoppingCartID
       WHERE vsc.CustomerID = ? AND vsc.Status = "ACTIVE"
       GROUP BY vsc.ShoppingCartID`,
      [userId]
    );

    if (cart.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: "No active cart found" });
    }

    const cartData = cart[0];

    if (!cartData.productIds) {
      await connection.rollback();
      return res.status(400).json({ error: "Cart is empty" });
    }

    const productIds = cartData.productIds.split(",");
    const quantities = cartData.quantities.split(",");

    const [inventoryCheck] = await connection.query(
      `SELECT ProductID, InventoryQuantity 
       FROM inventory 
       WHERE ProductID IN (?)`,
      [productIds]
    );

    const inventoryMap = inventoryCheck.reduce((acc, item) => {
      acc[item.ProductID] = item.InventoryQuantity;
      return acc;
    }, {});

    for (let i = 0; i < productIds.length; i++) {
      if (inventoryMap[productIds[i]] < quantities[i]) {
        await connection.rollback();
        return res.status(400).json({
          error: `Insufficient inventory for product ID ${productIds[i]}`,
        });
      }
    }

    const [userLoyalty] = await connection.query(
      `SELECT c.LoyaltyTier, lt.DiscountRate
       FROM customers c
       LEFT JOIN loyalty_tiers lt ON lt.TierName = c.LoyaltyTier
       WHERE c.CustomerID = ?`,
      [userId]
    );

    const discountRate = userLoyalty[0]?.DiscountRate || 0;

    const discountAmount = cartData.SumofProducts * (discountRate / 100);
    const finalAmount = cartData.SumofProducts - discountAmount;

    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        UserID, 
        ShoppingCartID, 
        OrderDate, 
        OrderStatus, 
        TotalAmount
      ) VALUES (?, ?, NOW(), 1, ?)`,
      [userId, cartData.ShoppingCartID, finalAmount]
    );

    const orderId = orderResult.insertId;

    const orderItemsValues = productIds.map((productId, index) => [
      orderId,
      productId,
      quantities[index],
    ]);

    await connection.query(
      `INSERT INTO order_items (OrderID, ProductID, Quantity) 
       VALUES ?`,
      [orderItemsValues]
    );

    await connection.query(
      `INSERT INTO payments (
        PaymentID,
        OrderID,
        CustomerID,
        DiscountID,
        PaymentType,
        PaymentAmount,
        TotalDiscount,
        FinalAmount,
        PaymentDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        orderId,
        orderId,
        userId,
        1,
        paymentDetails.type,
        cartData.SumofProducts,
        discountAmount,
        finalAmount,
      ]
    );

    for (let i = 0; i < productIds.length; i++) {
      await connection.query(
        `UPDATE inventory 
         SET InventoryQuantity = InventoryQuantity - ? 
         WHERE ProductID = ?`,
        [quantities[i], productIds[i]]
      );
    }

    await connection.query(
      `UPDATE virtualshoppingcart 
       SET Status = "COMPLETED", LastUpdate = NOW() 
       WHERE ShoppingCartID = ?`,
      [cartData.ShoppingCartID]
    );

    await connection.commit();

    res.json({
      message: "Order created successfully",
      orderId,
      orderSummary: {
        subtotal: cartData.SumofProducts,
        discount: discountAmount,
        finalAmount: finalAmount,
        loyaltyPointsEarned: Math.floor(finalAmount / 10),
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Order error:", error);
    res.status(500).json({ error: "Failed to create order: " + error.message });
  } finally {
    connection.release();
  }
});
exports.removeFromCart = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const [cart] = await db.query(
      'SELECT * FROM virtualshoppingcart WHERE CustomerID = ? AND Status = "ACTIVE"',
      [userId]
    );

    if (cart.length === 0) {
      return res.status(404).json({ error: "No active cart found" });
    }

    await db.query(
      "DELETE FROM shoppingcartitems WHERE ShoppingCartID = ? AND ProductID = ?",
      [cart[0].ShoppingCartID, productId]
    );

    await db.query(
      `UPDATE virtualshoppingcart 
         SET SumOfProducts = (
           SELECT COALESCE(SUM(i.Price * sci.ProductQuantity), 0)
           FROM shoppingcartitems sci
           JOIN inventory i ON i.ProductID = sci.ProductID
           WHERE sci.ShoppingCartID = ?
         ),
         LastUpdate = NOW()
         WHERE ShoppingCartID = ?`,
      [cart[0].ShoppingCartID, cart[0].ShoppingCartID]
    );

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
});

exports.updateQuantity = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.userId;

    if (quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    const [cart] = await db.query(
      'SELECT * FROM virtualshoppingcart WHERE CustomerID = ? AND Status = "ACTIVE"',
      [userId]
    );

    if (cart.length === 0) {
      return res.status(404).json({ error: "No active cart found" });
    }

    const [product] = await db.query(
      "SELECT * FROM inventory WHERE ProductID = ? AND InventoryQuantity >= ?",
      [productId, quantity]
    );

    if (product.length === 0) {
      return res
        .status(400)
        .json({ error: "Product not available in requested quantity" });
    }

    await db.query(
      "UPDATE shoppingcartitems SET ProductQuantity = ? WHERE ShoppingCartID = ? AND ProductID = ?",
      [quantity, cart[0].ShoppingCartID, productId]
    );

    await db.query(
      `UPDATE virtualshoppingcart 
         SET SumOfProducts = (
           SELECT SUM(i.Price * sci.ProductQuantity) 
           FROM shoppingcartitems sci
           JOIN inventory i ON i.ProductID = sci.ProductID
           WHERE sci.ShoppingCartID = ?
         ),
         LastUpdate = NOW()
         WHERE ShoppingCartID = ?`,
      [cart[0].ShoppingCartID, cart[0].ShoppingCartID]
    );

    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ error: "Failed to update cart" });
  }
});
