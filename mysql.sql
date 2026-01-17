CREATE DATABASE IF NOT EXISTS users_db;

USE users_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(100) NOT NULL UNIQUE,

    role ENUM('SELLER', 'MANAGER', 'ADMIN') NOT NULL DEFAULT 'SELLER',

    password VARCHAR(255) NOT NULL,

    email VARCHAR(255) NOT NULL,

    profileImage LONGTEXT NULL
);

CREATE DATABASE IF NOT EXISTS logs_db;

USE logs_db;

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,

    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    type ENUM('INFO', 'WARNING', 'ERROR') NOT NULL DEFAULT 'INFO',

    description VARCHAR(255)
);

CREATE DATABASE IF NOT EXISTS production_db;

USE production_db;

CREATE TABLE IF NOT EXISTS plants (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100),

    latinName VARCHAR(100),

    countryOrigin VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS fields_plants (
	plantId INT,
    
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    name VARCHAR(100),
    
    aromaticPower FLOAT DEFAULT 1,

    latinName VARCHAR(100),

    countryOrigin VARCHAR(100),
    
	state ENUM('PLANTED', 'HARVESTED', 'PROCESSED') NOT NULL DEFAULT 'PLANTED',
    
    FOREIGN KEY(plantId) REFERENCES plants(id)
);

CREATE DATABASE IF NOT EXISTS processing_db;

USE processing_db;

CREATE TABLE IF NOT EXISTS perfumes (
	id INT AUTO_INCREMENT PRIMARY KEY,
    
    serialNumber VARCHAR(100),
    
    name VARCHAR(100),
    
    type ENUM('PERFUME', 'COLOGNE') NOT NULL,
    
    quantity INT,
    
    plantId INT,
    
    state ENUM('PRODUCED', 'PACKAGED') NOT NULL,
    
    expirationDate DATE
);

CREATE DATABASE IF NOT EXISTS izvestaji_analize;

USE izvestaji_analize;

CREATE TABLE IF NOT EXISTS fiscal_receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,

    saleType ENUM('RETAIL', 'WHOLESALE') NOT NULL,

    paymentMethod ENUM('CASH', 'CARD', 'MIXED') NOT NULL,

    soldPerfumes JSON NOT NULL,

    totalAmount DECIMAL(10, 2) NOT NULL,

    saleDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    sellerId INT NULL,

    receiptNumber VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS analysis_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,

    analysisType ENUM('SALES_BY_MONTH', 'SALES_BY_WEEK', 'SALES_BY_YEAR', 'TOTAL_SALES', 'SALES_TREND', 'TOP_10_PERFUMES', 'TOP_10_REVENUE') NOT NULL,

    title VARCHAR(255) NOT NULL,

    data JSON NOT NULL,

    description TEXT NULL,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    createdBy INT NULL,

    periodStart DATE NULL,

    periodEnd DATE NULL
);


GRANT ALL PRIVILEGES ON izvestaji_analize.* TO 'root'@'localhost';
FLUSH PRIVILEGES;

-- Sales Database
CREATE DATABASE IF NOT EXISTS sales_db;

USE sales_db;

CREATE TABLE IF NOT EXISTS storages (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    location VARCHAR(255) NOT NULL,

    maxCapacity INT NOT NULL,

    currentCapacity INT DEFAULT 0,

    type ENUM('DISTRIBUTION_CENTER', 'WAREHOUSE_CENTER') NOT NULL DEFAULT 'WAREHOUSE_CENTER'
);

CREATE TABLE IF NOT EXISTS fiscal_receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,

    saleType ENUM('RETAIL', 'WHOLESALE') NOT NULL,

    paymentMethod ENUM('CASH', 'BANK_TRANSFER', 'CARD') NOT NULL,

    soldPerfumes JSON NOT NULL,

    totalAmount DECIMAL(10, 2) NOT NULL,

    saleDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    sellerId INT NULL
);

-- Insert initial storage data
INSERT INTO storages (name, location, maxCapacity, currentCapacity, type) VALUES
('Distribution Center Paris', 'Rue de la Paix, Paris', 500, 250, 'DISTRIBUTION_CENTER'),
('Warehouse Center Marseille', 'Port de Marseille, Marseille', 300, 150, 'WAREHOUSE_CENTER'),
('Distribution Center Lyon', 'Avenue Charles de Gaulle, Lyon', 400, 200, 'DISTRIBUTION_CENTER');