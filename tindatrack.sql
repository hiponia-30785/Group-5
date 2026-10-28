/* =========================================
   TINDATRACK DATABASE
   Smart Sari-Sari Store Management System
   Database: tindatrack_db
========================================= */


/* 1. CREATE DATABASE */

CREATE DATABASE IF NOT EXISTS tindatrack_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE tindatrack_db;


/* =========================================
   2. USERS TABLE
   Stores registered user accounts
========================================= */

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,

    username VARCHAR(50) NOT NULL UNIQUE,

    email VARCHAR(150) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


/* =========================================
   3. STORE SETTINGS TABLE
   Stores store information and logo path
========================================= */

CREATE TABLE store_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    store_name VARCHAR(150) NOT NULL
        DEFAULT 'My Sari-Sari Store',

    owner_name VARCHAR(100),

    store_logo VARCHAR(255) DEFAULT NULL,

    address VARCHAR(255),

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


/* =========================================
   4. INVENTORY TABLE
   Stores product information and stock
========================================= */

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    product_name VARCHAR(150) NOT NULL,

    quantity INT NOT NULL DEFAULT 0,

    cost_per_item DECIMAL(10, 2) NOT NULL,

    selling_price DECIMAL(10, 2) NOT NULL,

    expiration_date DATE DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_product_quantity
        CHECK (quantity >= 0),

    CONSTRAINT chk_product_cost
        CHECK (cost_per_item >= 0),

    CONSTRAINT chk_product_price
        CHECK (selling_price >= 0),

    INDEX idx_product_name (product_name),

    INDEX idx_expiration_date (expiration_date)
);


/* =========================================
   5. SALES TABLE
   Stores individual sales transactions
========================================= */

CREATE TABLE sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    customer_name VARCHAR(100) DEFAULT NULL,

    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    payment_status ENUM(
        'Unpaid',
        'Partial',
        'Paid'
    ) NOT NULL DEFAULT 'Unpaid',

    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    notes TEXT DEFAULT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    INDEX idx_sale_date (sale_date),

    INDEX idx_payment_status (payment_status)
);


/* =========================================
   6. SALE ITEMS TABLE
   Stores products included in each sale
========================================= */

CREATE TABLE sale_items (
    sale_item_id INT AUTO_INCREMENT PRIMARY KEY,

    sale_id INT NOT NULL,

    product_id INT NOT NULL,

    product_name VARCHAR(150) NOT NULL,

    quantity_sold INT NOT NULL,

    cost_per_item DECIMAL(10, 2) NOT NULL,

    selling_price DECIMAL(10, 2) NOT NULL,

    subtotal DECIMAL(12, 2) NOT NULL,

    FOREIGN KEY (sale_id)
        REFERENCES sales(sale_id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_quantity_sold
        CHECK (quantity_sold > 0),

    CONSTRAINT chk_sale_item_cost
        CHECK (cost_per_item >= 0),

    CONSTRAINT chk_sale_item_price
        CHECK (selling_price >= 0),

    CONSTRAINT chk_sale_item_subtotal
        CHECK (subtotal >= 0)
);


/* =========================================
   7. SALE PAYMENTS TABLE
   Records manually entered payments
========================================= */

CREATE TABLE sale_payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,

    sale_id INT NOT NULL,

    user_id INT NOT NULL,

    amount DECIMAL(12, 2) NOT NULL,

    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    notes VARCHAR(255) DEFAULT NULL,

    FOREIGN KEY (sale_id)
        REFERENCES sales(sale_id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_payment_amount
        CHECK (amount > 0),

    INDEX idx_payment_date (payment_date)
);


/* =========================================
   8. EXPENSES TABLE
   Records store expenses
========================================= */

CREATE TABLE expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    expense_name VARCHAR(150) NOT NULL,

    category VARCHAR(100) DEFAULT NULL,

    amount DECIMAL(12, 2) NOT NULL,

    expense_date DATE NOT NULL,

    notes TEXT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_expense_amount
        CHECK (amount >= 0),

    INDEX idx_expense_date (expense_date)
);


/* =========================================
   9. CUSTOMERS TABLE
   Stores customers who may buy on credit
========================================= */

CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    customer_name VARCHAR(100) NOT NULL,

    contact_number VARCHAR(30) DEFAULT NULL,

    address VARCHAR(255) DEFAULT NULL,

    notes TEXT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    INDEX idx_customer_name (customer_name)
);


/* =========================================
   10. LINK SALES TO CUSTOMERS
   Allows a sale to have an optional customer
========================================= */

ALTER TABLE sales
ADD COLUMN customer_id INT DEFAULT NULL AFTER user_id;

ALTER TABLE sales
ADD CONSTRAINT fk_sales_customer
FOREIGN KEY (customer_id)
REFERENCES customers(customer_id)
ON DELETE SET NULL;


/* =========================================
   END OF DATABASE STRUCTURE
========================================= */