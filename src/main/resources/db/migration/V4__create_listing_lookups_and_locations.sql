CREATE TABLE listing_statuses (
    listing_status_id SMALLINT UNSIGNED NOT NULL,
    code VARCHAR(32) NOT NULL,
    display_name VARCHAR(80) NOT NULL,
    sort_order SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (listing_status_id), UNIQUE KEY uk_listing_statuses_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE conditions (
    condition_id SMALLINT UNSIGNED NOT NULL,
    code VARCHAR(32) NOT NULL,
    display_name VARCHAR(80) NOT NULL,
    sort_order SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (condition_id), UNIQUE KEY uk_conditions_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE currencies (
    currency_code CHAR(3) NOT NULL,
    display_name VARCHAR(80) NOT NULL,
    sort_order SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (currency_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE locations (
    location_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    parent_location_id BIGINT UNSIGNED NULL,
    level TINYINT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL,
    code VARCHAR(32) NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (location_id),
    UNIQUE KEY uk_locations_code (code),
    KEY ix_locations_parent_active_name (parent_location_id, is_active, name),
    CONSTRAINT fk_locations_parent FOREIGN KEY (parent_location_id) REFERENCES locations (location_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO listing_statuses (listing_status_id, code, display_name, sort_order, is_active) VALUES
    (1, 'ACTIVE', 'Đang bán', 1, TRUE), (2, 'SOLD', 'Đã bán', 2, TRUE),
    (3, 'ARCHIVED', 'Đã ẩn', 3, TRUE);
INSERT INTO conditions (condition_id, code, display_name, sort_order, is_active) VALUES
    (1, 'NEW', 'Mới', 1, TRUE), (2, 'LIKE_NEW', 'Như mới', 2, TRUE),
    (3, 'GOOD', 'Tốt', 3, TRUE), (4, 'FAIR', 'Đã qua sử dụng', 4, TRUE);
INSERT INTO currencies (currency_code, display_name, sort_order, is_active) VALUES ('VND', 'Việt Nam đồng', 1, TRUE);
