 -- REPORT 1
 
drop procedure if exists rptOrderHistoryForCustomer

DELIMITER // -- add start and end date 
-- rptOrderHistoryForCustomer(UserID, StartDate, EndDate)
-- enter userID for one user or null for all users
-- format of Date 'yyyy-mm-dd'
CREATE DEFINER=`serverAdminStepan`@`%` PROCEDURE `rptOrderHistoryForCustomer`(IN inUserID int, in startdate date, in enddate date)
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
			(o.userID = inUserID OR inUserID is null)
            and
            orderDate BETWEEN startDate AND endDate
		order by 
			OrderDate;

end // 
DELIMITER ;

-- CustomerID 3 - 5

call rptOrderHistoryForCustomer(null);

call rptOrderHistoryForCustomer(3);


