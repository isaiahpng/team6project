
-- rptItemsSoldByCategory()
-- No parameters

DELIMITER // 
drop procedure if exists rptItemsSoldByCategory;

CREATE DEFINER=`serverAdminStepan`@`%` PROCEDURE `rptItemsSoldByCategory`()
BEGIN 

SELECT 
count(*) 'Number of Items', tag, sum(price) 'Gross Sales'
-- *
FROM Inventory inv
join shoppingcartItems sci on sci.ProductID = inv.ProductID

group by Tag
order by tag
;
 
END // DELIMITER ;

call rptItemsSoldByCategory();