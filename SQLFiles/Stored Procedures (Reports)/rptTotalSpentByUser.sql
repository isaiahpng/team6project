drop procedure if exists rptTotalSpentByUser;

delimiter //
-- how many items bought, showw how we got sumofproducts, more metrics, avgspending, number of order 
create procedure rptTotalSpentByUser(in inUserID int)
begin

select sum(vsc.SumofProducts) AS TotalSpent

from
	orders o 
	join customers cust on cust.CustomerID = o.userID
	join users us on us.userID = o.userID
	join virtualshoppingcart vsc on vsc.ShoppingCartID = o.ShoppingCartID
	join orderStatusIndex osi on osi.id = o.orderStatus
		where
			o.userID = inUserID
	group by 
		us.userID;
        



end //
delimiter ;

call rptTotalSpentByUser(3);

 call rptTotalSpentByUser(4);
 
 select * from shoppingcartitems;
 select * from virtualshoppingcart;