drop procedure if exists rptItemQuantityAndRevenue;

delimiter // 

create procedure rptItemQuantityAndRevenue(
    IN StartDate DATE,
    IN EndDate DATE
)
begin

select 
    inv.ProductID,
    inv.ProductName,
    inv.ProductDescription,
    inv.Tag,
    inv.InventoryQuantity as CurrentStock,
    COUNT(DISTINCT o.UserID) as UniqueCustomers,
    SUM(sci.Quantity) as TotalQuantitySold,
    SUM(sci.Quantity * inv.Price) as TotalRevenue,
    inv.Price as CurrentPrice
from
    inventory inv
    left join shoppingcartitems sci on sci.ProductID = inv.ProductID
    left join virtualshoppingcart vsc on vsc.ShoppingCartID = sci.ShoppingCartID
    left join orders o on o.ShoppingCartID = vsc.ShoppingCartID
where 
    (o.OrderDate between StartDate and EndDate) or (StartDate is null and EndDate is null)
group by 
    inv.ProductID, inv.ProductName, inv.ProductDescription, inv.Tag, inv.InventoryQuantity, inv.Price
order by 
    TotalRevenue desc;

end //
delimiter ;

call rptItemQuantityAndRevenue(null, null);

select * from inventory;
select * from shoppingcartitems;
