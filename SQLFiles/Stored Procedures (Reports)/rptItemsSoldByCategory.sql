USE mydb;

DELIMITER //

DROP PROCEDURE IF EXISTS rptItemsSoldByCategory//

CREATE PROCEDURE rptItemsSoldByCategory(
    IN StartDate DATE,
    IN EndDate DATE
)
BEGIN
    -- First, ensure we have a valid date range
    IF StartDate > EndDate THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Start date cannot be later than end date';
    END IF;

    -- Category Summary
    WITH CategorySales AS (
        SELECT 
            i.Tag,
            COUNT(DISTINCT i.ProductID) as UniqueProducts,
            SUM(sci.ProductQuantity) as TotalItemsSold,
            SUM(sci.ProductQuantity * i.Price) as TotalRevenue,
            AVG(i.Price) as AveragePrice
        FROM 
            inventory i
            LEFT JOIN shoppingcartitems sci ON i.ProductID = sci.ProductID
            LEFT JOIN virtualshoppingcart vsc ON vsc.ShoppingCartID = sci.ShoppingCartID
            LEFT JOIN orders o ON o.ShoppingCartID = vsc.ShoppingCartID
                AND (o.OrderDate BETWEEN COALESCE(StartDate, '2000-01-01') AND COALESCE(EndDate, CURRENT_DATE))
        GROUP BY 
            i.Tag
    ),
    TopSellersByCategory AS (
        SELECT 
            i.Tag,
            i.ProductID,
            i.ProductName,
            i.Price,
            SUM(sci.ProductQuantity) as QuantitySold,
            SUM(sci.ProductQuantity * i.Price) as Revenue,
            ROW_NUMBER() OVER (PARTITION BY i.Tag ORDER BY SUM(sci.ProductQuantity) DESC) as RankInCategory
        FROM 
            inventory i
            LEFT JOIN shoppingcartitems sci ON i.ProductID = sci.ProductID
            LEFT JOIN virtualshoppingcart vsc ON vsc.ShoppingCartID = sci.ShoppingCartID
            LEFT JOIN orders o ON o.ShoppingCartID = vsc.ShoppingCartID
                AND (o.OrderDate BETWEEN COALESCE(StartDate, '2000-01-01') AND COALESCE(EndDate, CURRENT_DATE))
        GROUP BY 
            i.Tag, i.ProductID, i.ProductName, i.Price
    )

    -- Main Report Output
    SELECT 
        cs.Tag,
        cs.UniqueProducts,
        COALESCE(cs.TotalItemsSold, 0) as TotalItemsSold,
        COALESCE(cs.TotalRevenue, 0) as TotalRevenue,
        cs.AveragePrice,
        ts.ProductName as TopSellingItem,
        ts.QuantitySold as TopSellerQuantity,
        ts.Revenue as TopSellerRevenue,
        COALESCE(cs.TotalRevenue / NULLIF(cs.TotalItemsSold, 0), 0) as AverageRevenuePerItem,
        COALESCE(cs.TotalRevenue / 
            (SELECT SUM(TotalRevenue) FROM CategorySales) * 100, 0) as PercentageOfTotalRevenue
    FROM 
        CategorySales cs
        LEFT JOIN TopSellersByCategory ts ON cs.Tag = ts.Tag AND ts.RankInCategory = 1
    ORDER BY 
        cs.TotalRevenue DESC;

END //

DELIMITER ;

-- Example usage:
-- All time category performance
SELECT 'Report: All Time Category Performance' as '';
CALL rptItemsSoldByCategory(NULL, NULL);

-- Current year category performance
SELECT 'Report: Current Year Category Performance' as '';
CALL rptItemsSoldByCategory('2024-01-01', '2024-12-31');

-- Last month's category performance
SELECT 'Report: Last Month Category Performance' as '';
CALL rptItemsSoldByCategory('2024-02-01', '2024-02-29');
