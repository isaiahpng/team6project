drop procedure if exists rptItemQuantityAndRevenue;

delimiter // 

-- show how many items sold in this period, start and end date, how many different customers ordered this item
create procedure rptItemQuantityAndRevenue()
begin

select inv.ProductID, inv.InventoryQuantity, sum(inv.Price) 'TotalRevenue', inv.ProductName, inv.ProductDescription, inv.Tag

from
	inventory inv
		join shoppingcartitems sci on sci.ProductID = inv.ProductID
        
        group by inv.productID;

end //
delimiter ;

call rptItemQuantityAndRevenue();

select * from inventory;
select * from shoppingcartitems;
