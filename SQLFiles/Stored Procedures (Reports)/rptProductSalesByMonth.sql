-- Creates 

-- REPORT 2

drop procedure if exists productSalesByMonth;
DELIMITER // 
create procedure productSalesByMonth(in product_id int , in monthValue int)
begin

declare inputID int;
declare inputMonth int;

set inputID = product_id;
set inputMonth = monthValue;
-- int @inputID = 6969
-- int @inputMonth = 10

select sum(productQuantity), Month(orderDate), sum(price) -- , inv.ProductID, ProductName, ProductDescription
from inventory inv
join shoppingcartitems sci on sci.productID = inv.productID
-- join virtualshoppingcart csc on csc.ShoppingcartID = sci.shoppingcartID
join orders on orders.ShoppingCartID = sci.shoppingcartID
	where inv.ProductID = inputID
    and month(orderDate) = inputMonth
    
group by month(orderDate) ;

end // 
DELIMITER ;


-- call productSalesByMonth(1004, 10);
-- call salesByMonth(1000, 10);
-- call getProductDetails();

