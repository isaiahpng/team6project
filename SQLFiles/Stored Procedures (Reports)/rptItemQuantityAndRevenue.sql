drop procedure if exists rptItemQuantityAndRevenue;

delimiter // 

-- show how many items sold in this period, start and end date, how many different customers ordered this item
-- rptItemQuantityAndRevenue(StartDate, EndDate)
-- format of Date 'yyyy-mm-dd'

CREATE DEFINER=`serverAdminStepan`@`%` PROCEDURE `rptItemQuantityAndRevenue`(in startDay date, in endDay date)
begin


select inv.ProductID, inv.InventoryQuantity, sum(inv.Price) 'TotalRevenue', inv.ProductName, inv.ProductDescription, inv.Tag  , count(distinct ord.userID) as totalUniqueCustomers , sum(sci.ProductQuantity) as amountSold

from
	inventory inv
		join shoppingcartitems sci on sci.ProductID = inv.ProductID
        join virtualshoppingcart vsc on vsc.ShoppingCartID = sci.ShoppingCartID
        join orders ord on ord.ShoppingCartID = sci.shoppingcartID
        where
			orderDate BETWEEN startDay AND endDay
        group by inv.productID;

end
delimiter ;

call rptItemQuantityAndRevenue();

select * from inventory;
select * from shoppingcartitems;
