USE mydb;

DELIMITER //

DROP PROCEDURE IF EXISTS rptProductSalesByMonth//

CREATE PROCEDURE rptProductSalesByMonth(
    IN StartDate DATE,
    IN EndDate DATE
)
BEGIN
    -- Input validation
    IF StartDate > EndDate THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Start date cannot be later than end date';
    END IF;

    -- Create temporary tables for reuse
    DROP TEMPORARY TABLE IF EXISTS temp_monthly_totals;
    CREATE TEMPORARY TABLE temp_monthly_totals AS
    SELECT 
        DATE_FORMAT(o.OrderDate, '%Y-%m') as YearMonth,
        COUNT(DISTINCT o.OrderID) as TotalOrders,
        COUNT(DISTINCT o.UserID) as UniqueCustomers,
        SUM(sci.ProductQuantity) as TotalItemsSold,
        SUM(sci.ProductQuantity * i.Price) as TotalRevenue,
        AVG(sci.ProductQuantity * i.Price) as AvgOrderValue
    FROM 
        orders o
        JOIN shoppingcartitems sci ON o.ShoppingCartID = sci.ShoppingCartID
        JOIN inventory i ON sci.ProductID = i.ProductID
    WHERE 
        o.OrderDate BETWEEN COALESCE(StartDate, '2000-01-01') AND COALESCE(EndDate, CURRENT_DATE)
    GROUP BY 
        DATE_FORMAT(o.OrderDate, '%Y-%m');

    -- 1. Monthly Overview
    SELECT 'Monthly Sales Overview:' as '';
    SELECT 
        YearMonth,
        TotalOrders,
        UniqueCustomers,
        TotalItemsSold,
        ROUND(TotalRevenue, 2) as TotalRevenue,
        ROUND(TotalRevenue / TotalOrders, 2) as AvgOrderValue,
        ROUND(TotalItemsSold / TotalOrders, 1) as AvgItemsPerOrder
    FROM 
        temp_monthly_totals
    ORDER BY 
        YearMonth DESC;

    -- 2. Top Products by Month
    SELECT 'Top Products by Month:' as '';
    WITH ProductMonthly AS (
        SELECT 
            DATE_FORMAT(o.OrderDate, '%Y-%m') as YearMonth,
            i.ProductID,
            i.ProductName,
            i.Tag as Category,
            SUM(sci.ProductQuantity) as QuantitySold,
            SUM(sci.ProductQuantity * i.Price) as Revenue,
            COUNT(DISTINCT o.UserID) as UniqueCustomers
        FROM 
            orders o
            JOIN shoppingcartitems sci ON o.ShoppingCartID = sci.ShoppingCartID
            JOIN inventory i ON sci.ProductID = i.ProductID
        WHERE 
            o.OrderDate BETWEEN COALESCE(StartDate, '2000-01-01') AND COALESCE(EndDate, CURRENT_DATE)
        GROUP BY 
            DATE_FORMAT(o.OrderDate, '%Y-%m'),
            i.ProductID,
            i.ProductName,
            i.Tag
    )
    SELECT 
        p.*,
        ROUND(p.Revenue / 
            (SELECT TotalRevenue 
             FROM temp_monthly_totals t
             WHERE t.YearMonth = p.YearMonth) * 100, 1) as PercentageOfMonthlyRevenue
    FROM ProductMonthly p
    ORDER BY 
        YearMonth DESC,
        Revenue DESC;

    -- 3. Category Performance by Month
    SELECT 'Category Performance by Month:' as '';
    WITH CategoryMonthly AS (
        SELECT 
            DATE_FORMAT(o.OrderDate, '%Y-%m') as YearMonth,
            i.Tag as Category,
            COUNT(DISTINCT i.ProductID) as UniqueProducts,
            SUM(sci.ProductQuantity) as TotalItemsSold,
            SUM(sci.ProductQuantity * i.Price) as Revenue,
            COUNT(DISTINCT o.UserID) as UniqueCustomers,
            AVG(i.Price) as AvgPricePoint
        FROM 
            orders o
            JOIN shoppingcartitems sci ON o.ShoppingCartID = sci.ShoppingCartID
            JOIN inventory i ON sci.ProductID = i.ProductID
        WHERE 
            o.OrderDate BETWEEN COALESCE(StartDate, '2000-01-01') AND COALESCE(EndDate, CURRENT_DATE)
        GROUP BY 
            DATE_FORMAT(o.OrderDate, '%Y-%m'),
            i.Tag
    )
    SELECT 
        c.*,
        ROUND(c.Revenue / 
            (SELECT TotalRevenue 
             FROM temp_monthly_totals t
             WHERE t.YearMonth = c.YearMonth) * 100, 1) as PercentageOfMonthlyRevenue,
        ROUND(c.AvgPricePoint, 2) as AvgPricePoint
    FROM CategoryMonthly c
    ORDER BY 
        YearMonth DESC,
        Revenue DESC;

    -- 4. Month-over-Month Growth (if applicable)
    SELECT 'Month-over-Month Growth:' as '';
    WITH MonthlyGrowth AS (
        SELECT 
            t1.YearMonth,
            t1.TotalRevenue,
            t1.TotalOrders,
            t1.UniqueCustomers,
            ROUND(((t1.TotalRevenue - LAG(t1.TotalRevenue) OVER (ORDER BY t1.YearMonth)) / 
                LAG(t1.TotalRevenue) OVER (ORDER BY t1.YearMonth) * 100), 1) as RevenueGrowth,
            ROUND(((t1.TotalOrders - LAG(t1.TotalOrders) OVER (ORDER BY t1.YearMonth)) / 
                LAG(t1.TotalOrders) OVER (ORDER BY t1.YearMonth) * 100), 1) as OrderGrowth,
            ROUND(((t1.UniqueCustomers - LAG(t1.UniqueCustomers) OVER (ORDER BY t1.YearMonth)) / 
                LAG(t1.UniqueCustomers) OVER (ORDER BY t1.YearMonth) * 100), 1) as CustomerGrowth
        FROM temp_monthly_totals t1
    )
    SELECT 
        YearMonth,
        ROUND(TotalRevenue, 2) as Revenue,
        COALESCE(RevenueGrowth, 0) as RevenueGrowthPercent,
        TotalOrders,
        COALESCE(OrderGrowth, 0) as OrderGrowthPercent,
        UniqueCustomers,
        COALESCE(CustomerGrowth, 0) as CustomerGrowthPercent
    FROM MonthlyGrowth
    ORDER BY YearMonth DESC;

    -- Clean up
    DROP TEMPORARY TABLE IF EXISTS temp_monthly_totals;
END //

DELIMITER ;

-- Example usage:
-- Current year report
SELECT 'Report: Current Year Sales' as '';
CALL rptProductSalesByMonth('2024-01-01', '2024-12-31');

-- Last 3 months report
SELECT 'Report: Last 3 Months Sales' as '';
CALL rptProductSalesByMonth(DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH), CURRENT_DATE);

-- All time report
SELECT 'Report: All Time Sales' as '';
CALL rptProductSalesByMonth(NULL, NULL);
