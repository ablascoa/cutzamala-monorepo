-- Cutzamala Water Storage Database Schema
-- This schema stores daily water storage readings from Cutzamala system reservoirs

DROP TABLE IF EXISTS cutzamala_readings;

CREATE TABLE cutzamala_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    month_name VARCHAR(20) NOT NULL,
    day INTEGER NOT NULL,
    
    -- Valle de Bravo reservoir data
    valle_bravo_mm3 REAL DEFAULT 0.0,
    valle_bravo_pct REAL DEFAULT 0.0,
    valle_bravo_lluvia REAL DEFAULT 0.0,
    
    -- Villa Victoria reservoir data
    villa_victoria_mm3 REAL DEFAULT 0.0,
    villa_victoria_pct REAL DEFAULT 0.0,
    villa_victoria_lluvia REAL DEFAULT 0.0,
    
    -- El Bosque reservoir data
    el_bosque_mm3 REAL DEFAULT 0.0,
    el_bosque_pct REAL DEFAULT 0.0,
    el_bosque_lluvia REAL DEFAULT 0.0,
    
    -- System totals
    total_mm3 INTEGER DEFAULT 0,
    total_pct REAL DEFAULT 0.0,
    
    -- Metadata
    source_pdf VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_cutzamala_date ON cutzamala_readings(date);
CREATE INDEX idx_cutzamala_year_month ON cutzamala_readings(year, month);
CREATE INDEX idx_cutzamala_year ON cutzamala_readings(year);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_cutzamala_updated_at 
    AFTER UPDATE ON cutzamala_readings
    FOR EACH ROW
BEGIN
    UPDATE cutzamala_readings 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;