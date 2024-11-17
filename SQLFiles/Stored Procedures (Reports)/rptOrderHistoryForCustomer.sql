USE mydb;

DELIMITER //

DROP PROCEDURE IF EXISTS rptOrderHistoryForCustomer//

CREATE PROCEDURE rptOrderHistoryForCustomer(
    IN CustomerID INT,
    IN StartDate DATE,
    IN EndDate DATE
)
BEGIN
    -- First, ensure we have a valid date range
    IF StartDate > EndDate THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Start date cannot be later than end date';
    END IF;

    -- Create temporary tables for reuse
    DROP TEMPORARY TABLE IF EXISTS temp_customer_summary;
    CREATE TEMPORARY TABLE temp_customer_summary AS
    SELECT 
        o.UserID,
        COUNT(DISTINCT o.OrderID) as TotalOrders,
        COUNT(DISTINCT sci.ProductID) as UniqueItemsPurchased,
        SUM(sci.ProductQuantity) as TotalItemsPurchased,
        SUM(sci.ProductQuantity * i.Price) as TotalSpent,
        MIN(o.OrderDate) as FirstOrderDate,
        MAX(o.OrderDate) as LastOrderDate,
        DATEDIFF(MAX(o.OrderDate), MIN(o.OrderDate)) as DaysSinceFirstOrder
    FROM 
        orders o
        JOIN shoppingcartitems sci ON o.ShoppingCartID = sci.ShoppingCartID
        JOIN inventory i ON sci.ProductID = i.ProductID
    WHERE 
        o.UserID = CustomerID
        AND (o.OrderDate BETWEEN COALESCE(StartDate, '2000-01-01') AND COALESCE(EndDate, CURRENT_DATE))
    GROUP BY 
        o.UserID;

    DROP TEMPORARY TABLE IF EXISTS temp_order_totals;
    CREATE TEMPORARY TABLE temp_order_totals AS
    SELECT 
        o.OrderID,
        SUM(sci.ProductQuantity * i.Price) as OrderTotal
    FROM orders o
    JOIN shoppingcartitems sci ON o.ShoppingCartID = sci.ShoppingCartID
    JOIN inventory i ON sci.ProductID = i.ProductID
    WHERE o.UserID = CustomerID
    GROUP BY o.OrderID;

    -- Output customer summary
    SELECT 'Customer Summary:' as '';
    SELECT 
        cs.UserID as CustomerID,
        cs.TotalOrders,
        cs.UniqueItemsPurchased,
        cs.TotalItemsPurchased,
        cs.TotalSpent,
        cs.FirstOrderDate,
        cs.LastOrderDate,
        cs.DaysSinceFirstOrder,
        COALESCE(cs.TotalSpent / cs.TotalOrders, 0) as AverageOrderValue,
        COALESCE(cs.TotalItemsPurchased / cs.TotalOrders, 0) as AverageItemsPerOrder
    FROM temp_customer_summary cs;

    -- Output detailed order history
    SELECT 'Detailed Order History:' as '';
    SELECT 
        o.OrderID,
        o.OrderDate,
        i.ProductName,
        i.Tag as Category,
        sci.ProductQuantity,
        i.Price as UnitPrice,
        (sci.ProductQuantity * i.Price) as LineTotal,
        ot.OrderTotal,
        ROUND((sci.ProductQuantity * i.Price) / ot.OrderTotal * 100, 2) as PercentageOfOrder
    FROM 
        orders o
        JOIN shoppingcartitems sci ON o.ShoppingCartID = sci.ShoppingCartID
        JOIN inventory i ON sci.ProductID = i.ProductID
        JOIN temp_order_totals ot ON o.OrderID = ot.OrderID
    WHERE 
        o.UserID = CustomerID
        AND (o.OrderDate BETWEEN COALESCE(StartDate, '2000-01-01') AND COALESCE(EndDate, CURRENT_DATE))
    ORDER BY 
        o.OrderDate DESC,
        LineTotal DESC;

    -- Output favorite categories
    SELECT 'Customer Preferences:' as '';
    SELECT 
        i.Tag as Category,
        COUNT(DISTINCT i.ProductID) as UniqueItemsBought,
        SUM(sci.ProductQuantity) as TotalItemsBought,
        SUM(sci.ProductQuantity * i.Price) as TotalSpentInCategory,
        ROUND(AVG(i.Price), 2) as AveragePricePoint
    FROM 
        orders o
        JOIN shoppingcartitems sci ON o.ShoppingCartID = sci.ShoppingCartID
        JOIN inventory i ON sci.ProductID = i.ProductID
    WHERE 
        o.UserID = CustomerID
        AND (o.OrderDate BETWEEN COALESCE(StartDate, '2000-01-01') AND COALESCE(EndDate, CURRENT_DATE))
    GROUP BY 
        i.Tag
    ORDER BY 
        TotalSpentInCategory DESC;

    -- Clean up temporary tables
    DROP TEMPORARY TABLE IF EXISTS temp_customer_summary;
    DROP TEMPORARY TABLE IF EXISTS temp_order_totals;
END //

DELIMITER ;

-- Example usage:
-- All time history for customer 4
SELECT 'Report: All Time History for Customer 4' as '';
CALL rptOrderHistoryForCustomer(4, NULL, NULL);

-- Current year history for customer 3
SELECT 'Report: Current Year History for Customer 3' as '';
CALL rptOrderHistoryForCustomer(3, '2024-01-01', '2024-12-31');

-- Last month history for customer 5
SELECT 'Report: Last Month History for Customer 5' as '';
CALL rptOrderHistoryForCustomer(5, '2024-02-01', '2024-02-29');
