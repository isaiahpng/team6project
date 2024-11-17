drop procedure if exists rptTotalSpentByUser;

delimiter //
-- how many items bought, showw how we got sumofproducts, more metrics, avgspending, number of order 
-- rptTotalSpentByUser(UserID)
-- enter userID for one user or null for all users
CREATE DEFINER=`serverAdminStepan`@`%` PROCEDURE `rptTotalSpentByUser`(in inUserID int)
begin

select sum(vsc.SumofProducts) AS TotalSpent, 
	count(o.orderID) as NumberOfOrders,
    truncate(avg(vsc.SumofProducts),2) as AverageSpending,
    sum(ProductQuantity) as TotalItemsBought

from
	orders o 
	join customers cust on cust.CustomerID = o.userID
	join users us on us.userID = o.userID
	join virtualshoppingcart vsc on vsc.ShoppingCartID = o.ShoppingCartID
    join shoppingcartitems sci on sci.ShoppingCartID = vsc.ShoppingCartID
	join orderStatusIndex osi on osi.id = o.orderStatus
		where
			(o.userID = inUserID OR inUserID is null)
	group by 
		us.userID;
        



end //
delimiter ;

call rptTotalSpentByUser(3);

 call rptTotalSpentByUser(4);
 
 select * from shoppingcartitems;
 select * from virtualshoppingcart;