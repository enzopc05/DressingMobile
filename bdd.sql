-- Utilisateurs
CREATE TABLE
    users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(50),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Vêtements
CREATE TABLE
    clothes (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        sub_type VARCHAR(50),
        color VARCHAR(50) NOT NULL,
        season VARCHAR(50),
        image_url TEXT,
        price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

-- Tenues
CREATE TABLE
    outfits (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

-- Vêtements dans les tenues
CREATE TABLE
    outfit_clothes (
        outfit_id VARCHAR(36),
        clothing_id VARCHAR(36),
        PRIMARY KEY (outfit_id, clothing_id),
        FOREIGN KEY (outfit_id) REFERENCES outfits (id),
        FOREIGN KEY (clothing_id) REFERENCES clothes (id)
    );

-- Commandes en attente
CREATE TABLE
    pending_orders (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        store VARCHAR(255),
        expected_date DATE,
        tracking_number VARCHAR(100),
        note TEXT,
        status ENUM ('pending', 'received', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        received_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

-- Articles dans les commandes
CREATE TABLE
    order_items (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        sub_type VARCHAR(50),
        color VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2),
        image_url TEXT,
        FOREIGN KEY (order_id) REFERENCES pending_orders (id)
    );