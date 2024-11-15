 -- REPORT 1
 
drop procedure if exists rptOrderHistoryForCustomer

DELIMITER // -- add start and end date 
create procedure rptOrderHistoryForCustomer(IN inCustomerID int)
begin


select orderID, 
	OrderDate, 
		FirstName,
        LastName, 
		shippingAddress, 
        billingAddress, 
        SumOfProducts, 
        Status

from orders o 
	join customers cust on cust.CustomerID = o.userID
	join users us on us.userID = o.userID
	join virtualshoppingcart vsc on vsc.ShoppingCartID = o.ShoppingCartID
	join orderStatusIndex osi on osi.id = o.orderStatus
		where 
			(o.userID = inCustomerID OR inCustomerID is null)
		order by 
			OrderDate;

end //
DELIMITER ;

-- CustomerID 3 - 5

call rptOrderHistoryForCustomer(null);

call rptOrderHistoryForCustomer(3);


