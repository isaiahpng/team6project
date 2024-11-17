-- Creates 
-- REPORT 2

-- rptProductSalesByMonth(InputID, Month (int))
-- enter productID for inputID param, Month value 1-12 for month or null for either to get all of that value


drop procedure if exists productSalesByMonth;
DELIMITER // 
CREATE DEFINER=`serverAdminStepan`@`%` PROCEDURE `productSalesByMonth`(in inputID int , in monthValue int)
begin


select sum(productQuantity) as TotalQuantity,
 Month(orderDate) as OrderMonth,
 sum(price * sci.ProductQuantity) as TotalPrice,
 ProductName,
 ProductDescription,
 inv.ProductID -- , ProductName, ProductDescription
 
from 
inventory inv
join shoppingcartitems sci on sci.productID = inv.productID
-- join virtualshoppingcart csc on csc.ShoppingcartID = sci.shoppingcartID
join orders o on o.ShoppingCartID = sci.shoppingcartID
	where 
		(inv.ProductID = inputID OR inputID is null)
        and (month(o.OrderDate) = monthvalue or Monthvalue is null)
    
group by month(o.orderDate), ProductName, Productdescription, ProductID ;

end //
DELIMITER ;


-- call productSalesByMonth(1004, 10);
-- call salesByMonth(1000, 10);
-- call getProductDetails();

