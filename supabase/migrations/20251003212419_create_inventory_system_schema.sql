/*
  # Auto Parts Inventory Management System - Database Schema

  ## Overview
  Complete database schema for an auto parts inventory management system with authentication,
  inventory tracking, sales management, supplier management, and analytics.

  ## 1. New Tables

  ### `profiles`
  User profile information linked to auth.users
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `role` (text) - admin, manager, employee
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `suppliers`
  Supplier/provider information
  - `id` (uuid, primary key)
  - `name` (text) - supplier name
  - `contact_person` (text)
  - `phone` (text)
  - `email` (text)
  - `address` (text)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `products`
  Main inventory products table
  - `id` (uuid, primary key)
  - `code` (text, unique) - unique product code
  - `image_url` (text) - product image
  - `type` (text) - Compresor, Evaporador, Condensador, etc.
  - `brand` (text) - Toyota, Hyundai, Ford, etc.
  - `model` (text) - Yaris, Etios, Sportage, etc.
  - `year_range` (text) - year range compatibility
  - `stock` (integer) - available stock
  - `min_stock` (integer) - minimum stock threshold for alerts
  - `unit_price` (decimal)
  - `supplier_id` (uuid, references suppliers)
  - `warehouse_location` (text) - storage location
  - `description` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `customers`
  Customer information
  - `id` (uuid, primary key)
  - `name` (text)
  - `phone` (text)
  - `email` (text)
  - `address` (text)
  - `created_at` (timestamptz)

  ### `sales`
  Sales transactions
  - `id` (uuid, primary key)
  - `sale_number` (text, unique) - auto-generated sale number
  - `customer_id` (uuid, references customers)
  - `customer_name` (text) - denormalized for quick access
  - `subtotal` (decimal)
  - `discount` (decimal)
  - `total` (decimal)
  - `payment_method` (text) - cash, card, transfer, etc.
  - `notes` (text)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)

  ### `sale_items`
  Individual items in each sale
  - `id` (uuid, primary key)
  - `sale_id` (uuid, references sales)
  - `product_id` (uuid, references products)
  - `product_code` (text) - denormalized
  - `product_name` (text) - denormalized (type + brand + model)
  - `quantity` (integer)
  - `unit_price` (decimal)
  - `total` (decimal)

  ### `inventory_movements`
  Track all inventory changes (entries and exits)
  - `id` (uuid, primary key)
  - `product_id` (uuid, references products)
  - `movement_type` (text) - entry, exit, adjustment
  - `quantity` (integer) - positive for entry, negative for exit
  - `reason` (text) - sale, purchase, adjustment, return, etc.
  - `reference_id` (uuid) - reference to sale_id or other transaction
  - `notes` (text)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)

  ## 2. Security

  ### Row Level Security (RLS)
  - Enable RLS on all tables
  - Authenticated users can read all data
  - Only authenticated users can perform write operations
  - Admins have full access

  ### Policies
  Created for each table with appropriate permissions:
  - SELECT: authenticated users can read
  - INSERT: authenticated users can create
  - UPDATE: authenticated users can update
  - DELETE: authenticated users can delete

  ## 3. Indexes
  - Product code, brand, model, type for fast searching
  - Foreign keys for optimal joins
  - Sale dates for reporting

  ## 4. Functions
  - Trigger to update stock after sales
  - Function to generate sale numbers
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (true);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  image_url text,
  type text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  year_range text,
  stock integer DEFAULT 0 CHECK (stock >= 0),
  min_stock integer DEFAULT 5,
  unit_price decimal(10, 2) NOT NULL CHECK (unit_price >= 0),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  warehouse_location text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_model ON products(model);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  subtotal decimal(10, 2) NOT NULL DEFAULT 0,
  discount decimal(10, 2) DEFAULT 0,
  total decimal(10, 2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL,
  notes text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sales"
  ON sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sales"
  ON sales FOR DELETE
  TO authenticated
  USING (true);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_code text NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10, 2) NOT NULL,
  total decimal(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sale items"
  ON sale_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sale items"
  ON sale_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sale items"
  ON sale_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sale items"
  ON sale_items FOR DELETE
  TO authenticated
  USING (true);

-- Inventory movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('entry', 'exit', 'adjustment')),
  quantity integer NOT NULL,
  reason text NOT NULL,
  reference_id uuid,
  notes text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(created_at);

ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view inventory movements"
  ON inventory_movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert inventory movements"
  ON inventory_movements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to generate sale number
CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS text AS $$
DECLARE
  next_num integer;
  sale_num text;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(sale_number FROM 6) AS integer)), 0) + 1
  INTO next_num
  FROM sales
  WHERE sale_number LIKE 'SALE-%';
  
  sale_num := 'SALE-' || LPAD(next_num::text, 6, '0');
  RETURN sale_num;
END;
$$ LANGUAGE plpgsql;

-- Function to update product stock after sale
CREATE OR REPLACE FUNCTION update_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = stock - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id;
  
  INSERT INTO inventory_movements (
    product_id,
    movement_type,
    quantity,
    reason,
    reference_id,
    created_by
  ) VALUES (
    NEW.product_id,
    'exit',
    -NEW.quantity,
    'sale',
    NEW.sale_id,
    (SELECT created_by FROM sales WHERE id = NEW.sale_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stock updates
DROP TRIGGER IF EXISTS trigger_update_stock_after_sale ON sale_items;
CREATE TRIGGER trigger_update_stock_after_sale
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_after_sale();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();