drop procedure if exists rptAdminOrderHistory;

DELIMITER // 
create procedure rptAdminOrderHistory(
    IN inCustomerID INT,
    IN StartDate DATE,
    IN EndDate DATE
)
begin
    SELECT 
        o.OrderID,
        o.OrderDate,
        c.FirstName,
        c.LastName,
        c.Email,
        o.ShippingAddress,
        o.BillingAddress,
        vsc.SumOfProducts,
        osi.Status,
        GROUP_CONCAT(
            CONCAT(inv.ProductName, ' (', sci.Quantity, ' @ $', inv.Price, ')')
            SEPARATOR '; '
        ) as OrderDetails
    FROM orders o 
        JOIN customers c ON c.CustomerID = o.CustomerID
        JOIN virtualshoppingcart vsc ON vsc.ShoppingCartID = o.ShoppingCartID
        JOIN orderStatusIndex osi ON osi.id = o.OrderStatus
        JOIN shoppingcartitems sci ON sci.ShoppingCartID = vsc.ShoppingCartID
        JOIN inventory inv ON inv.ProductID = sci.ProductID
    WHERE 
        (o.CustomerID = inCustomerID OR inCustomerID IS NULL)
        AND (o.OrderDate BETWEEN StartDate AND EndDate OR (StartDate IS NULL AND EndDate IS NULL))
    GROUP BY 
        o.OrderID, o.OrderDate, c.FirstName, c.LastName, c.Email,
        o.ShippingAddress, o.BillingAddress, vsc.SumOfProducts, osi.Status
    ORDER BY 
        o.OrderDate DESC;
end //
DELIMITER ;

-- Example calls
CALL rptAdminOrderHistory(NULL, NULL, NULL);  -- All orders
CALL rptAdminOrderHistory(3, '2023-01-01', '2023-12-31');  -- Specific customer orders
