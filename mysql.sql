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

INSERT INTO plants (name, latinName, countryOrigin) VALUES
('Rose', 'Rosa', 'France'),
('Jasmin', 'Jasminum', 'India'),
('Lavender', 'Lavandula', 'France'),
('Sunflower', 'Helianthus annuus', 'USA'),
('Aloe Vera', 'Aloe vera', 'Egypt');

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

INSERT INTO perfumes (serialNumber, name, type, quantity, plantId, state, expirationDate) VALUES
('PP-2026-1', 'Rose Elegance', 'PERFUME', 100, 1, 'PRODUCED', '2027-02-08'),
('PP-2026-2', 'Midnight Rose', 'PERFUME', 80, 1, 'PRODUCED', '2027-02-08'),
('PP-2026-3', 'Jasmine Dream', 'PERFUME', 90, 2, 'PRODUCED', '2027-02-08'),
('PP-2026-4', 'White Jasmine Mist', 'COLOGNE', 110, 2, 'PRODUCED', '2027-02-08'),
('PP-2026-5', 'Lavender Calm', 'PERFUME', 85, 3, 'PRODUCED', '2027-02-08'),
('PP-2026-6', 'Provence Lavender', 'PERFUME', 95, 3, 'PRODUCED', '2027-02-08'),
('PP-2026-7', 'Golden Sunflower', 'COLOGNE', 75, 4, 'PRODUCED', '2027-02-08'),
('PP-2026-8', 'Summer Fields', 'COLOGNE', 88, 4, 'PRODUCED', '2027-02-08'),
('PP-2026-9', 'Aloe Fresh', 'COLOGNE', 92, 5, 'PRODUCED', '2027-02-08'),
('PP-2026-10', 'Desert Aloe Breeze', 'PERFUME', 105, 5, 'PRODUCED', '2027-02-08');

CREATE TABLE IF NOT EXISTS catalog (
	id INT AUTO_INCREMENT PRIMARY KEY,
    
    serialNumber VARCHAR(100),
    
    name VARCHAR(100),
    
    plantId INT
);

INSERT INTO catalog (serialNumber, name, plantId) VALUES
('PP-2026-1', 'Rose Elegance', 1),
('PP-2026-2', 'Midnight Rose', 1),

('PP-2026-3', 'Jasmine Dream', 2),
('PP-2026-4', 'White Jasmine Mist', 2),

('PP-2026-5', 'Lavender Calm', 3),
('PP-2026-6', 'Provence Lavender', 3),

('PP-2026-7', 'Golden Sunflower', 4),
('PP-2026-8', 'Summer Fields', 4),

('PP-2026-9', 'Aloe Fresh', 5),
('PP-2026-10', 'Desert Aloe Breeze', 5);

CREATE TABLE IF NOT EXISTS packagings (
	id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    adress VARCHAR(255) NOT NULL,
    storageId INT NOT NULL,
    perfumeIds JSON NOT NULL,
    status ENUM ('SENT', 'PACKAGED') NOT NULL
);

INSERT INTO packagings (name, adress, storageId, perfumeIds, status) VALUES
('Package Load 1', 'Warehouse Center Marseille', 1, '[1, 2, 3]', 'PACKAGED'),
('Package Load 2', 'Warehouse Center Marseille', 1, '[4, 5, 6]', 'PACKAGED'),
('Package Load 3', 'Distribution Center Paris', 2, '[7, 8]', 'PACKAGED'),
('Package Load 4', 'Warehouse Center Marseille', 1, '[9, 10]', 'PACKAGED');

CREATE DATABASE IF NOT EXISTS analytics_db;

USE analytics_db;

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

    total DOUBLE NULL,
    
    receipts JSON NULL,
    
    perfumes JSON NULL,
    
    extraData DOUBLE NULL,

    description TEXT NULL,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    createdBy INT NULL,

    periodStart DATE NULL,

    periodEnd DATE NULL
);

CREATE DATABASE IF NOT EXISTS performance_db;

USE performance_db;

CREATE TABLE IF NOT EXISTS performance_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,

    algorithmType ENUM('DISTRIBUTIVE_CENTER', 'WAREHOUSE_CENTER') NOT NULL,

    title VARCHAR(255) NOT NULL,

    simulationData JSON NOT NULL,

    efficiencyMetrics JSON NOT NULL,

    conclusions TEXT NULL,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    createdBy INT NULL,

    packagesProcessed INT DEFAULT 0,

    averageProcessingTime DECIMAL(10, 2) DEFAULT 0,

    totalSimulationTime DECIMAL(10, 2) DEFAULT 0
);

CREATE DATABASE IF NOT EXISTS storage_db;

USE storage_db;

CREATE TABLE IF NOT EXISTS storages (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    location VARCHAR(255) NOT NULL,

    maxCapacity INT NOT NULL,

    currentCapacity INT DEFAULT 0,

    type ENUM('DISTRIBUTION_CENTER', 'WAREHOUSE_CENTER') NOT NULL DEFAULT 'WAREHOUSE_CENTER'
);

INSERT INTO storages (name, location, maxCapacity, currentCapacity, type) VALUES
('Distribution Center Paris', 'Rue de la Paix, Paris', 500, 250, 'DISTRIBUTION_CENTER'),
('Warehouse Center Marseille', 'Port de Marseille, Marseille', 300, 150, 'WAREHOUSE_CENTER'),
('Distribution Center Lyon', 'Avenue Charles de Gaulle, Lyon', 400, 200, 'DISTRIBUTION_CENTER');