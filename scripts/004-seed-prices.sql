-- Seed data: Store-product prices
-- Prices vary by store to enable meaningful optimization

-- Get store IDs dynamically based on name patterns
-- We'll use explicit ID references assuming the order from our insert

-- Walmart tends to have lowest prices
-- Target has mid-range prices
-- Costco has bulk pricing (lower per unit)
-- Safeway has moderate prices
-- Whole Foods has premium prices
-- Trader Joe's has good value on their brand items

-- Dairy products pricing
INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 5.98
    WHEN s.chain = 'TARGET' THEN 6.49
    WHEN s.chain = 'COSTCO' THEN 9.99  -- larger size typically
    WHEN s.chain = 'SAFEWAY' THEN 6.79
    WHEN s.chain = 'WHOLE_FOODS' THEN 7.99
    WHEN s.chain = 'TRADER_JOES' THEN 5.49
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Whole Milk' AND p.brand = 'Organic Valley'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 3.48
    WHEN s.chain = 'TARGET' THEN 3.99
    WHEN s.chain = 'COSTCO' THEN 8.99
    WHEN s.chain = 'SAFEWAY' THEN 4.29
    WHEN s.chain = 'WHOLE_FOODS' THEN 4.99
    WHEN s.chain = 'TRADER_JOES' THEN 3.29
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Large Eggs' AND p.brand = 'Kirkland Signature'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 6.99
    WHEN s.chain = 'TARGET' THEN 7.49
    WHEN s.chain = 'COSTCO' THEN 12.99
    WHEN s.chain = 'SAFEWAY' THEN 7.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 8.99
    WHEN s.chain = 'TRADER_JOES' THEN 7.49
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Large Eggs' AND p.brand = 'Vital Farms'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 4.98
    WHEN s.chain = 'TARGET' THEN 5.29
    WHEN s.chain = 'COSTCO' THEN 7.99
    WHEN s.chain = 'SAFEWAY' THEN 5.49
    WHEN s.chain = 'WHOLE_FOODS' THEN 5.99
    WHEN s.chain = 'TRADER_JOES' THEN 3.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Butter Unsalted'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 5.98
    WHEN s.chain = 'TARGET' THEN 6.49
    WHEN s.chain = 'COSTCO' THEN 9.99
    WHEN s.chain = 'SAFEWAY' THEN 6.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 7.49
    WHEN s.chain = 'TRADER_JOES' THEN 5.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Greek Yogurt Plain'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

-- Bread & Bakery pricing
INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 4.98
    WHEN s.chain = 'TARGET' THEN 5.49
    WHEN s.chain = 'COSTCO' THEN 6.99
    WHEN s.chain = 'SAFEWAY' THEN 5.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 6.99
    WHEN s.chain = 'TRADER_JOES' THEN 4.49
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Sourdough Bread'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 5.48
    WHEN s.chain = 'TARGET' THEN 5.99
    WHEN s.chain = 'COSTCO' THEN 8.99
    WHEN s.chain = 'SAFEWAY' THEN 6.29
    WHEN s.chain = 'WHOLE_FOODS' THEN 6.99
    WHEN s.chain = 'TRADER_JOES' THEN 5.49
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Whole Wheat Bread'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

-- Meat pricing
INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 7.98
    WHEN s.chain = 'TARGET' THEN 8.99
    WHEN s.chain = 'COSTCO' THEN 19.99
    WHEN s.chain = 'SAFEWAY' THEN 9.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 12.99
    WHEN s.chain = 'TRADER_JOES' THEN 8.49
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Chicken Breast Boneless'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 5.98
    WHEN s.chain = 'TARGET' THEN 6.99
    WHEN s.chain = 'COSTCO' THEN 16.99
    WHEN s.chain = 'SAFEWAY' THEN 7.49
    WHEN s.chain = 'WHOLE_FOODS' THEN 9.99
    WHEN s.chain = 'TRADER_JOES' THEN 6.49
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Ground Beef 80/20'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 5.98
    WHEN s.chain = 'TARGET' THEN 6.49
    WHEN s.chain = 'COSTCO' THEN 14.99
    WHEN s.chain = 'SAFEWAY' THEN 7.29
    WHEN s.chain = 'WHOLE_FOODS' THEN 9.99
    WHEN s.chain = 'TRADER_JOES' THEN 5.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Bacon'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 9.98
    WHEN s.chain = 'TARGET' THEN 10.99
    WHEN s.chain = 'COSTCO' THEN 24.99
    WHEN s.chain = 'SAFEWAY' THEN 12.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 14.99
    WHEN s.chain = 'TRADER_JOES' THEN 9.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Atlantic Salmon Fillet'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

-- Produce pricing
INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 0.58
    WHEN s.chain = 'TARGET' THEN 0.69
    WHEN s.chain = 'COSTCO' THEN 1.99
    WHEN s.chain = 'SAFEWAY' THEN 0.79
    WHEN s.chain = 'WHOLE_FOODS' THEN 0.99
    WHEN s.chain = 'TRADER_JOES' THEN 0.19
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Bananas'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 3.98
    WHEN s.chain = 'TARGET' THEN 4.49
    WHEN s.chain = 'COSTCO' THEN 6.99
    WHEN s.chain = 'SAFEWAY' THEN 4.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 5.99
    WHEN s.chain = 'TRADER_JOES' THEN 3.49
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Avocados'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 3.98
    WHEN s.chain = 'TARGET' THEN 4.29
    WHEN s.chain = 'COSTCO' THEN 5.99
    WHEN s.chain = 'SAFEWAY' THEN 4.49
    WHEN s.chain = 'WHOLE_FOODS' THEN 4.99
    WHEN s.chain = 'TRADER_JOES' THEN 2.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Baby Spinach'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 1.48
    WHEN s.chain = 'TARGET' THEN 1.79
    WHEN s.chain = 'COSTCO' THEN 4.99
    WHEN s.chain = 'SAFEWAY' THEN 1.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 2.99
    WHEN s.chain = 'TRADER_JOES' THEN 1.49
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Roma Tomatoes'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 2.98
    WHEN s.chain = 'TARGET' THEN 3.49
    WHEN s.chain = 'COSTCO' THEN 5.99
    WHEN s.chain = 'SAFEWAY' THEN 3.79
    WHEN s.chain = 'WHOLE_FOODS' THEN 4.49
    WHEN s.chain = 'TRADER_JOES' THEN 2.49
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Yellow Onions'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 3.98
    WHEN s.chain = 'TARGET' THEN 4.49
    WHEN s.chain = 'COSTCO' THEN 7.99
    WHEN s.chain = 'SAFEWAY' THEN 4.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 5.99
    WHEN s.chain = 'TRADER_JOES' THEN 3.49
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Russet Potatoes'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 1.68
    WHEN s.chain = 'TARGET' THEN 1.99
    WHEN s.chain = 'COSTCO' THEN 4.99
    WHEN s.chain = 'SAFEWAY' THEN 2.29
    WHEN s.chain = 'WHOLE_FOODS' THEN 2.99
    WHEN s.chain = 'TRADER_JOES' THEN 1.79
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Broccoli Crowns'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 3.98
    WHEN s.chain = 'TARGET' THEN 4.49
    WHEN s.chain = 'COSTCO' THEN 8.99
    WHEN s.chain = 'SAFEWAY' THEN 4.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 5.99
    WHEN s.chain = 'TRADER_JOES' THEN 3.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Strawberries'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

-- Pantry items pricing
INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 1.28
    WHEN s.chain = 'TARGET' THEN 1.49
    WHEN s.chain = 'COSTCO' THEN 3.99
    WHEN s.chain = 'SAFEWAY' THEN 1.79
    WHEN s.chain = 'WHOLE_FOODS' THEN 2.29
    WHEN s.chain = 'TRADER_JOES' THEN 0.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Spaghetti'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 2.48
    WHEN s.chain = 'TARGET' THEN 2.99
    WHEN s.chain = 'COSTCO' THEN 5.99
    WHEN s.chain = 'SAFEWAY' THEN 3.29
    WHEN s.chain = 'WHOLE_FOODS' THEN 3.99
    WHEN s.chain = 'TRADER_JOES' THEN 1.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Penne Rigate'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 7.98
    WHEN s.chain = 'TARGET' THEN 8.49
    WHEN s.chain = 'COSTCO' THEN 12.99
    WHEN s.chain = 'SAFEWAY' THEN 8.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 9.99
    WHEN s.chain = 'TRADER_JOES' THEN 5.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Marinara Sauce'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 8.98
    WHEN s.chain = 'TARGET' THEN 9.99
    WHEN s.chain = 'COSTCO' THEN 16.99
    WHEN s.chain = 'SAFEWAY' THEN 10.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 12.99
    WHEN s.chain = 'TRADER_JOES' THEN 6.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Extra Virgin Olive Oil'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 4.98
    WHEN s.chain = 'TARGET' THEN 5.49
    WHEN s.chain = 'COSTCO' THEN 8.99
    WHEN s.chain = 'SAFEWAY' THEN 5.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 6.99
    WHEN s.chain = 'TRADER_JOES' THEN 4.49
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Long Grain White Rice'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 1.18
    WHEN s.chain = 'TARGET' THEN 1.39
    WHEN s.chain = 'COSTCO' THEN 4.99
    WHEN s.chain = 'SAFEWAY' THEN 1.59
    WHEN s.chain = 'WHOLE_FOODS' THEN 1.99
    WHEN s.chain = 'TRADER_JOES' THEN 0.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Black Beans'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 2.48
    WHEN s.chain = 'TARGET' THEN 2.79
    WHEN s.chain = 'COSTCO' THEN 6.99
    WHEN s.chain = 'SAFEWAY' THEN 2.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 3.49
    WHEN s.chain = 'TRADER_JOES' THEN 1.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Diced Tomatoes'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 2.98
    WHEN s.chain = 'TARGET' THEN 3.29
    WHEN s.chain = 'COSTCO' THEN 7.99
    WHEN s.chain = 'SAFEWAY' THEN 3.49
    WHEN s.chain = 'WHOLE_FOODS' THEN 4.49
    WHEN s.chain = 'TRADER_JOES' THEN 2.49
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Chicken Broth'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

-- Snacks pricing
INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 3.98
    WHEN s.chain = 'TARGET' THEN 4.29
    WHEN s.chain = 'COSTCO' THEN 8.99
    WHEN s.chain = 'SAFEWAY' THEN 4.79
    WHEN s.chain = 'WHOLE_FOODS' THEN 5.49
    WHEN s.chain = 'TRADER_JOES' THEN 2.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Tortilla Chips'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 3.48
    WHEN s.chain = 'TARGET' THEN 3.99
    WHEN s.chain = 'COSTCO' THEN 9.99
    WHEN s.chain = 'SAFEWAY' THEN 4.29
    WHEN s.chain = 'WHOLE_FOODS' THEN 4.99
    WHEN s.chain = 'TRADER_JOES' THEN 2.49
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Potato Chips Original'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 8.98
    WHEN s.chain = 'TARGET' THEN 9.99
    WHEN s.chain = 'COSTCO' THEN 16.99
    WHEN s.chain = 'SAFEWAY' THEN 10.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 12.99
    WHEN s.chain = 'TRADER_JOES' THEN 7.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Mixed Nuts'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 2.98
    WHEN s.chain = 'TARGET' THEN 3.49
    WHEN s.chain = 'COSTCO' THEN 6.99
    WHEN s.chain = 'SAFEWAY' THEN 3.79
    WHEN s.chain = 'WHOLE_FOODS' THEN 4.49
    WHEN s.chain = 'TRADER_JOES' THEN 2.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Peanut Butter'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

-- Beverages pricing
INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 3.98
    WHEN s.chain = 'TARGET' THEN 4.29
    WHEN s.chain = 'COSTCO' THEN 9.99
    WHEN s.chain = 'SAFEWAY' THEN 4.79
    WHEN s.chain = 'WHOLE_FOODS' THEN 5.49
    WHEN s.chain = 'TRADER_JOES' THEN 3.49
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Orange Juice'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 8.98
    WHEN s.chain = 'TARGET' THEN 9.99
    WHEN s.chain = 'COSTCO' THEN 16.99
    WHEN s.chain = 'SAFEWAY' THEN 10.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 12.99
    WHEN s.chain = 'TRADER_JOES' THEN 7.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Coffee Ground'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 4.98
    WHEN s.chain = 'TARGET' THEN 5.49
    WHEN s.chain = 'COSTCO' THEN 12.99
    WHEN s.chain = 'SAFEWAY' THEN 5.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 6.99
    WHEN s.chain = 'TRADER_JOES' THEN 3.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Sparkling Water'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

-- Frozen pricing
INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 4.98
    WHEN s.chain = 'TARGET' THEN 5.49
    WHEN s.chain = 'COSTCO' THEN 11.99
    WHEN s.chain = 'SAFEWAY' THEN 5.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 6.99
    WHEN s.chain = 'TRADER_JOES' THEN 3.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Vanilla Ice Cream'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 6.98
    WHEN s.chain = 'TARGET' THEN 7.49
    WHEN s.chain = 'COSTCO' THEN 14.99
    WHEN s.chain = 'SAFEWAY' THEN 8.49
    WHEN s.chain = 'WHOLE_FOODS' THEN 9.99
    WHEN s.chain = 'TRADER_JOES' THEN 5.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Frozen Pizza Pepperoni'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 2.48
    WHEN s.chain = 'TARGET' THEN 2.79
    WHEN s.chain = 'COSTCO' THEN 6.99
    WHEN s.chain = 'SAFEWAY' THEN 2.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 3.99
    WHEN s.chain = 'TRADER_JOES' THEN 1.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Frozen Vegetables Mixed'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

-- Household pricing
INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 12.98
    WHEN s.chain = 'TARGET' THEN 14.99
    WHEN s.chain = 'COSTCO' THEN 24.99
    WHEN s.chain = 'SAFEWAY' THEN 15.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 17.99
    WHEN s.chain = 'TRADER_JOES' THEN 9.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Paper Towels'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 3.48
    WHEN s.chain = 'TARGET' THEN 3.99
    WHEN s.chain = 'COSTCO' THEN 9.99
    WHEN s.chain = 'SAFEWAY' THEN 4.29
    WHEN s.chain = 'WHOLE_FOODS' THEN 4.99
    WHEN s.chain = 'TRADER_JOES' THEN 2.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Dish Soap'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 11.98
    WHEN s.chain = 'TARGET' THEN 12.99
    WHEN s.chain = 'COSTCO' THEN 22.99
    WHEN s.chain = 'SAFEWAY' THEN 13.99
    WHEN s.chain = 'WHOLE_FOODS' THEN 15.99
    WHEN s.chain = 'TRADER_JOES' THEN 8.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Laundry Detergent'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;

INSERT INTO store_product_prices (store_id, product_id, price, in_stock) 
SELECT s.id, p.id, 
  CASE 
    WHEN s.chain = 'WALMART' THEN 8.98
    WHEN s.chain = 'TARGET' THEN 9.99
    WHEN s.chain = 'COSTCO' THEN 16.99
    WHEN s.chain = 'SAFEWAY' THEN 10.49
    WHEN s.chain = 'WHOLE_FOODS' THEN 12.99
    WHEN s.chain = 'TRADER_JOES' THEN 7.99
  END,
  TRUE
FROM stores s, products p 
WHERE p.name = 'Trash Bags'
ON CONFLICT (store_id, product_id) DO UPDATE SET price = EXCLUDED.price;
