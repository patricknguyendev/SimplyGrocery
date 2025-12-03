-- Seed data: Common grocery products across various categories

INSERT INTO products (name, brand, category, size_value, size_unit, upc, metadata) VALUES
-- Dairy
('Whole Milk', 'Organic Valley', 'Dairy', 64, 'oz', '093966000012', '{"organic": true}'),
('2% Reduced Fat Milk', 'Horizon', 'Dairy', 64, 'oz', '742365000000', '{"organic": true}'),
('Large Eggs', 'Kirkland Signature', 'Dairy', 24, 'ct', '096619000000', '{"cage_free": true}'),
('Large Eggs', 'Vital Farms', 'Dairy', 12, 'ct', '851659000000', '{"pasture_raised": true}'),
('Butter Unsalted', 'Kerrygold', 'Dairy', 8, 'oz', '072610000000', '{"grass_fed": true}'),
('Greek Yogurt Plain', 'Fage', 'Dairy', 32, 'oz', '689544000000', '{}'),
('Shredded Mozzarella', 'Kraft', 'Dairy', 8, 'oz', '021000000000', '{}'),
('Cream Cheese', 'Philadelphia', 'Dairy', 8, 'oz', '021000002000', '{}'),

-- Bread & Bakery
('Sourdough Bread', 'Boudin', 'Bakery', 24, 'oz', '000000000001', '{}'),
('Whole Wheat Bread', 'Daves Killer Bread', 'Bakery', 27, 'oz', '013764000000', '{"organic": true}'),
('Bagels Plain', 'Thomas', 'Bakery', 6, 'ct', '048121000000', '{}'),
('Tortillas Flour', 'Mission', 'Bakery', 10, 'ct', '073731000000', '{}'),

-- Meat & Seafood
('Chicken Breast Boneless', 'Perdue', 'Meat', 1.5, 'lb', '072745000000', '{}'),
('Ground Beef 80/20', 'Certified Angus', 'Meat', 1, 'lb', '000000000002', '{}'),
('Bacon', 'Oscar Mayer', 'Meat', 16, 'oz', '044700000000', '{}'),
('Atlantic Salmon Fillet', 'Wild Caught', 'Seafood', 1, 'lb', '000000000003', '{"wild_caught": true}'),

-- Produce
('Bananas', 'Dole', 'Produce', 1, 'lb', '000000000004', '{}'),
('Avocados', 'Hass', 'Produce', 4, 'ct', '000000000005', '{}'),
('Baby Spinach', 'Organic Girl', 'Produce', 5, 'oz', '000000000006', '{"organic": true}'),
('Roma Tomatoes', 'Generic', 'Produce', 1, 'lb', '000000000007', '{}'),
('Yellow Onions', 'Generic', 'Produce', 3, 'lb', '000000000008', '{}'),
('Russet Potatoes', 'Generic', 'Produce', 5, 'lb', '000000000009', '{}'),
('Broccoli Crowns', 'Generic', 'Produce', 1, 'lb', '000000000010', '{}'),
('Strawberries', 'Driscoll', 'Produce', 16, 'oz', '000000000011', '{}'),
('Lemons', 'Sunkist', 'Produce', 1, 'each', '000000000012', '{}'),
('Garlic', 'Generic', 'Produce', 3, 'ct', '000000000013', '{}'),

-- Pantry Staples
('Spaghetti', 'Barilla', 'Pasta', 16, 'oz', '076808000000', '{}'),
('Penne Rigate', 'De Cecco', 'Pasta', 16, 'oz', '024094000000', '{}'),
('Marinara Sauce', 'Raos', 'Sauces', 24, 'oz', '850080000000', '{}'),
('Extra Virgin Olive Oil', 'California Olive Ranch', 'Oils', 16.9, 'oz', '867672000000', '{}'),
('Vegetable Oil', 'Crisco', 'Oils', 48, 'oz', '051500000000', '{}'),
('Long Grain White Rice', 'Jasmine', 'Grains', 5, 'lb', '000000000014', '{}'),
('Jasmine Rice', 'Royal', 'Grains', 2, 'lb', '000000000015', '{}'),
('Black Beans', 'Goya', 'Canned Goods', 15.5, 'oz', '041331000000', '{}'),
('Diced Tomatoes', 'Muir Glen', 'Canned Goods', 14.5, 'oz', '725342000000', '{"organic": true}'),
('Chicken Broth', 'Swanson', 'Canned Goods', 32, 'oz', '051000000000', '{}'),

-- Snacks
('Tortilla Chips', 'Tostitos', 'Snacks', 13, 'oz', '028400000000', '{}'),
('Potato Chips Original', 'Lays', 'Snacks', 10, 'oz', '028400001000', '{}'),
('Mixed Nuts', 'Planters', 'Snacks', 15, 'oz', '029000000000', '{}'),
('Peanut Butter', 'Jif', 'Spreads', 16, 'oz', '051500240000', '{}'),
('Strawberry Jam', 'Smuckers', 'Spreads', 18, 'oz', '051500000001', '{}'),

-- Beverages
('Orange Juice', 'Tropicana', 'Beverages', 52, 'oz', '048500000000', '{}'),
('Coffee Ground', 'Folgers', 'Beverages', 30.5, 'oz', '025500000000', '{}'),
('Green Tea', 'Tazo', 'Beverages', 20, 'ct', '794522000000', '{}'),
('Sparkling Water', 'LaCroix', 'Beverages', 12, 'ct', '012993000000', '{}'),

-- Frozen
('Vanilla Ice Cream', 'Haagen-Dazs', 'Frozen', 14, 'oz', '074570000000', '{}'),
('Frozen Pizza Pepperoni', 'DiGiorno', 'Frozen', 27.5, 'oz', '071921000000', '{}'),
('Frozen Vegetables Mixed', 'Birds Eye', 'Frozen', 16, 'oz', '014500000000', '{}'),
('Frozen Chicken Nuggets', 'Tyson', 'Frozen', 32, 'oz', '023700000000', '{}'),

-- Cleaning & Household
('Paper Towels', 'Bounty', 'Household', 6, 'rolls', '037000000000', '{}'),
('Dish Soap', 'Dawn', 'Household', 19.4, 'oz', '037000001000', '{}'),
('Laundry Detergent', 'Tide', 'Household', 92, 'oz', '037000002000', '{}'),
('Trash Bags', 'Glad', 'Household', 45, 'ct', '012587000000', '{}')

ON CONFLICT DO NOTHING;
