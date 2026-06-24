-- ============================================================
-- Embroidery Management System - PostgreSQL Schema
-- ============================================================

-- Drop tables in reverse dependency order if they exist
DROP TABLE IF EXISTS BackupLog CASCADE;
DROP TABLE IF EXISTS Expense CASCADE;
DROP TABLE IF EXISTS Invoice CASCADE;
DROP TABLE IF EXISTS Payment CASCADE;
DROP TABLE IF EXISTS Production CASCADE;
DROP TABLE IF EXISTS OrderDesign CASCADE;
DROP TABLE IF EXISTS Material CASCADE;
DROP TABLE IF EXISTS Supplier CASCADE;
DROP TABLE IF EXISTS Machine CASCADE;
DROP TABLE IF EXISTS Employee CASCADE;
DROP TABLE IF EXISTS Design CASCADE;
DROP TABLE IF EXISTS Orders CASCADE;
DROP TABLE IF EXISTS Customer CASCADE;
DROP TABLE IF EXISTS UserLogin CASCADE;

-- ============================================================
-- 1. Customer Table
-- ============================================================
CREATE TABLE Customer (
    CustomerID SERIAL PRIMARY KEY,
    Name VARCHAR(80) NOT NULL,
    Phone VARCHAR(12),
    Email VARCHAR(80),
    Address VARCHAR(255),
    GSTNumber VARCHAR(20)
);

-- ============================================================
-- 2. Orders Table
-- ============================================================
CREATE TABLE Orders (
    OrderID SERIAL PRIMARY KEY,
    CustomerID INT,
    OrderDate DATE NOT NULL,
    DueDate DATE,
    TotalAmount NUMERIC(10,2),
    Status VARCHAR(20) DEFAULT 'Pending',
    PaymentStatus VARCHAR(20) DEFAULT 'Unpaid',
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
        ON DELETE CASCADE
);

-- ============================================================
-- 3. Design Table
-- ============================================================
CREATE TABLE Design (
    DesignID SERIAL PRIMARY KEY,
    DesignName VARCHAR(100) NOT NULL,
    Description TEXT,
    FilePath VARCHAR(255),
    StitchCount INT,
    ThreadColors VARCHAR(100),
    DesignRate DECIMAL(10,2)
);

-- ============================================================
-- 4. OrderDesign Table
-- ============================================================
CREATE TABLE OrderDesign (
    OrderDesignID SERIAL PRIMARY KEY,
    OrderID INT,
    DesignID INT,
    Quantity INT,
    PricePerUnit DECIMAL(10,2),
    SubTotal DECIMAL(10,2),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
        ON DELETE CASCADE,
    FOREIGN KEY (DesignID) REFERENCES Design(DesignID)
        ON DELETE CASCADE
);

-- ============================================================
-- 5. Employee Table
-- ============================================================
CREATE TABLE Employee (
    EmployeeID SERIAL PRIMARY KEY,
    Name VARCHAR(80) NOT NULL,
    ContactNumber VARCHAR(12),
    Role VARCHAR(40) DEFAULT 'Machine Operator',
    Salary NUMERIC(10,2),
    JoinDate DATE
);

-- ============================================================
-- 6. Machine Table
-- ============================================================
CREATE TABLE Machine (
    MachineID SERIAL PRIMARY KEY,
    MachineName VARCHAR(100),
    Brand VARCHAR(50),
    Model VARCHAR(50),
    Status VARCHAR(20) DEFAULT 'Active',
    Location VARCHAR(100)
);

-- ============================================================
-- 7. Production Table
-- ============================================================
CREATE TABLE Production (
    ProductionID SERIAL PRIMARY KEY,
    OrderID INT,
    MachineID INT,
    EmployeeID INT,
    StartDate TIMESTAMP,
    EndDate TIMESTAMP,
    QuantityProduced INT,
    Remarks TEXT,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
        ON DELETE CASCADE,
    FOREIGN KEY (MachineID) REFERENCES Machine(MachineID)
        ON DELETE SET NULL,
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
        ON DELETE SET NULL
);

-- ============================================================
-- 8. Payment Table
-- ============================================================
CREATE TABLE Payment (
    PaymentID SERIAL PRIMARY KEY,
    OrderID INT,
    PaymentDate DATE,
    AmountPaid DECIMAL(10,2),
    PaymentMode VARCHAR(20),
    TransactionReference VARCHAR(100),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
        ON DELETE CASCADE
);

-- ============================================================
-- 9. Supplier Table
-- ============================================================
CREATE TABLE Supplier (
    SupplierID SERIAL PRIMARY KEY,
    Name VARCHAR(80),
    ContactNumber VARCHAR(12),
    Email VARCHAR(80),
    Address VARCHAR(255)
);

-- ============================================================
-- 10. Material Table
-- ============================================================
CREATE TABLE Material (
    MaterialID SERIAL PRIMARY KEY,
    MaterialName VARCHAR(100),
    QuantityAvailable DECIMAL(10,2),
    Unit VARCHAR(20),
    CostPerUnit DECIMAL(10,2),
    SupplierID INT,
    FOREIGN KEY (SupplierID) REFERENCES Supplier(SupplierID)
        ON DELETE SET NULL
);

-- ============================================================
-- 11. UserLogin Table
-- ============================================================
CREATE TABLE UserLogin (
    UserID SERIAL PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(20) DEFAULT 'Employee',
    LastLogin TIMESTAMP,
    Status VARCHAR(10) DEFAULT 'Active'
);

-- ============================================================
-- 12. Invoice Table
-- ============================================================
CREATE TABLE Invoice (
    InvoiceID SERIAL PRIMARY KEY,
    OrderID INT,
    InvoiceDate DATE,
    TaxAmount DECIMAL(10,2),
    Discount DECIMAL(10,2),
    NetTotal DECIMAL(10,2),
    Remarks TEXT,
    GeneratedBy INT,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
        ON DELETE CASCADE,
    FOREIGN KEY (GeneratedBy) REFERENCES UserLogin(UserID)
        ON DELETE SET NULL
);

-- ============================================================
-- 13. Expense Table
-- ============================================================
CREATE TABLE Expense (
    ExpenseID SERIAL PRIMARY KEY,
    ExpenseDate DATE,
    ExpenseType VARCHAR(50),
    Description TEXT,
    Amount DECIMAL(10,2),
    PaidTo VARCHAR(100),
    RecordedBy INT,
    FOREIGN KEY (RecordedBy) REFERENCES UserLogin(UserID)
        ON DELETE SET NULL
);

-- ============================================================
-- 14. BackupLog Table
-- ============================================================
CREATE TABLE BackupLog (
    BackupID SERIAL PRIMARY KEY,
    BackupDateTime TIMESTAMP,
    FileName VARCHAR(100),
    FilePath VARCHAR(255),
    PerformedBy INT,
    Remarks TEXT,
    FOREIGN KEY (PerformedBy) REFERENCES UserLogin(UserID)
        ON DELETE SET NULL
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX idx_orders_customerid ON Orders(CustomerID);
CREATE INDEX idx_orders_status ON Orders(Status);
CREATE INDEX idx_orderdesign_orderid ON OrderDesign(OrderID);
CREATE INDEX idx_orderdesign_designid ON OrderDesign(DesignID);
CREATE INDEX idx_production_orderid ON Production(OrderID);
CREATE INDEX idx_payment_orderid ON Payment(OrderID);
CREATE INDEX idx_material_supplierid ON Material(SupplierID);
CREATE INDEX idx_invoice_orderid ON Invoice(OrderID);
CREATE INDEX idx_expense_recordedby ON Expense(RecordedBy);
CREATE INDEX idx_customer_name ON Customer(Name);
CREATE INDEX idx_customer_phone ON Customer(Phone);
