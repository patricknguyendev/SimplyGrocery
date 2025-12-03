-- Seed data: Sample stores in the San Francisco Bay Area
-- These represent real store locations for testing

INSERT INTO stores (name, chain, lat, lon, address_line1, city, state, postal_code, metadata) VALUES
-- Walmart stores
('Walmart Supercenter Mountain View', 'WALMART', 37.4145, -122.0770, '600 Showers Dr', 'Mountain View', 'CA', '94040', '{"hours": "6am-11pm", "type": "supercenter"}'),
('Walmart Supercenter San Jose', 'WALMART', 37.3230, -121.8136, '777 Story Rd', 'San Jose', 'CA', '95122', '{"hours": "6am-11pm", "type": "supercenter"}'),
('Walmart Neighborhood Market Sunnyvale', 'WALMART', 37.3688, -122.0363, '150 E El Camino Real', 'Sunnyvale', 'CA', '94087', '{"hours": "7am-10pm", "type": "neighborhood"}'),

-- Target stores
('Target Cupertino', 'TARGET', 37.3230, -122.0322, '20745 Stevens Creek Blvd', 'Cupertino', 'CA', '95014', '{"hours": "8am-10pm", "type": "standard"}'),
('Target Mountain View', 'TARGET', 37.4025, -122.1098, '2000 W El Camino Real', 'Mountain View', 'CA', '94040', '{"hours": "8am-10pm", "type": "standard"}'),
('Target San Jose Almaden', 'TARGET', 37.2470, -121.8620, '5630 Cottle Rd', 'San Jose', 'CA', '95123', '{"hours": "8am-10pm", "type": "superTarget"}'),

-- Costco stores
('Costco Sunnyvale', 'COSTCO', 37.4085, -122.0115, '1000 N Mathilda Ave', 'Sunnyvale', 'CA', '94089', '{"hours": "10am-8:30pm", "type": "warehouse", "membership_required": true}'),
('Costco Mountain View', 'COSTCO', 37.4193, -122.0968, '2099 Leghorn St', 'Mountain View', 'CA', '94043', '{"hours": "10am-8:30pm", "type": "warehouse", "membership_required": true}'),
('Costco San Jose', 'COSTCO', 37.2507, -121.8048, '1709 Automation Pkwy', 'San Jose', 'CA', '95131', '{"hours": "10am-8:30pm", "type": "warehouse", "membership_required": true}'),

-- Safeway stores
('Safeway Palo Alto', 'SAFEWAY', 37.4419, -122.1430, '2811 Middlefield Rd', 'Palo Alto', 'CA', '94306', '{"hours": "6am-midnight", "type": "standard"}'),
('Safeway Los Altos', 'SAFEWAY', 37.3852, -122.1141, '2340 Homestead Rd', 'Los Altos', 'CA', '94024', '{"hours": "6am-midnight", "type": "standard"}'),
('Safeway Cupertino', 'SAFEWAY', 37.3175, -122.0110, '20620 Homestead Rd', 'Cupertino', 'CA', '95014', '{"hours": "6am-midnight", "type": "standard"}'),

-- Whole Foods stores
('Whole Foods Cupertino', 'WHOLE_FOODS', 37.3230, -122.0390, '20830 Stevens Creek Blvd', 'Cupertino', 'CA', '95014', '{"hours": "8am-9pm", "type": "standard"}'),
('Whole Foods Palo Alto', 'WHOLE_FOODS', 37.4335, -122.1275, '774 Emerson St', 'Palo Alto', 'CA', '94301', '{"hours": "8am-9pm", "type": "standard"}'),

-- Trader Joe's stores
('Trader Joes Los Altos', 'TRADER_JOES', 37.3812, -122.1185, '590 Showers Dr', 'Los Altos', 'CA', '94022', '{"hours": "8am-9pm", "type": "standard"}'),
('Trader Joes Sunnyvale', 'TRADER_JOES', 37.3794, -122.0231, '727 Sunnyvale Saratoga Rd', 'Sunnyvale', 'CA', '94087', '{"hours": "8am-9pm", "type": "standard"}')

ON CONFLICT DO NOTHING;
