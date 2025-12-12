USE travel;

-- ===========================
-- TABLE: users
-- ===========================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- TABLE: countries
-- ===========================
CREATE TABLE countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- ===========================
-- TABLE: cities
-- ===========================
CREATE TABLE cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_capital BOOLEAN DEFAULT 0,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    avg_hotel_price DECIMAL(10, 2) DEFAULT 40.00,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

-- Після створення cities — додаємо capital_city_id
ALTER TABLE countries
ADD capital_city_id INT NULL,
ADD CONSTRAINT fk_capital FOREIGN KEY (capital_city_id) REFERENCES cities(id);

-- ===========================
-- TABLE: attractions
-- ===========================
CREATE TABLE attractions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    main_photo_url VARCHAR(500),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    ticket_price DECIMAL(10, 2) DEFAULT 0.00,
    transport_cost DECIMAL(10, 2) DEFAULT 0.00,
    avg_visit_time INT DEFAULT 60,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

-- ===========================
-- TABLE: trips
-- ===========================
CREATE TABLE trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    country_id INT NOT NULL,
    city_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    status ENUM('planned', 'active', 'finished') DEFAULT 'planned',
    total_budget DECIMAL(12, 2) DEFAULT NULL,
    budget_details TEXT,
    recommended_plan LONGTEXT,
    attractions_count INT DEFAULT 0,
    visited_count INT DEFAULT 0,
    trip_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

-- ===========================
-- TABLE: trip_attractions
-- ===========================
CREATE TABLE trip_attractions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    attraction_id INT NOT NULL,
    is_visited BOOLEAN DEFAULT 0,
    day_number INT DEFAULT 1,
    visit_order INT,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_trip_attraction (trip_id, attraction_id)
);

-- Додамо індекси для швидкості
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trip_attractions_trip_id ON trip_attractions(trip_id);
CREATE INDEX idx_trip_attractions_attraction_id ON trip_attractions(attraction_id);