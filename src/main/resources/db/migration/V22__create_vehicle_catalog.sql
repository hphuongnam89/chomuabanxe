CREATE TABLE vehicle_brands (
    vehicle_brand_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(120) NOT NULL,
    sort_order SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (vehicle_brand_id),
    UNIQUE KEY uk_vehicle_brands_code (code),
    KEY ix_vehicle_brands_active_sort (is_active, sort_order, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE vehicle_models (
    vehicle_model_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    vehicle_brand_id BIGINT UNSIGNED NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(120) NOT NULL,
    sort_order SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (vehicle_model_id),
    UNIQUE KEY uk_vehicle_models_brand_code (vehicle_brand_id, code),
    UNIQUE KEY uk_vehicle_models_id_brand (vehicle_model_id, vehicle_brand_id),
    KEY ix_vehicle_models_brand_active_sort (vehicle_brand_id, is_active, sort_order, name),
    CONSTRAINT fk_vehicle_models_brand FOREIGN KEY (vehicle_brand_id) REFERENCES vehicle_brands (vehicle_brand_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE vehicle_origins (
    vehicle_origin_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(64) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    sort_order SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (vehicle_origin_id),
    UNIQUE KEY uk_vehicle_origins_code (code),
    KEY ix_vehicle_origins_active_sort (is_active, sort_order, display_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE vehicle_transmissions (
    vehicle_transmission_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(64) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    sort_order SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (vehicle_transmission_id),
    UNIQUE KEY uk_vehicle_transmissions_code (code),
    KEY ix_vehicle_transmissions_active_sort (is_active, sort_order, display_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE vehicle_fuels (
    vehicle_fuel_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(64) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    sort_order SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (vehicle_fuel_id),
    UNIQUE KEY uk_vehicle_fuels_code (code),
    KEY ix_vehicle_fuels_active_sort (is_active, sort_order, display_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE vehicle_colors (
    vehicle_color_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(64) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    sort_order SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (vehicle_color_id),
    UNIQUE KEY uk_vehicle_colors_code (code),
    KEY ix_vehicle_colors_active_sort (is_active, sort_order, display_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE vehicle_body_types (
    vehicle_body_type_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(64) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    sort_order SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (vehicle_body_type_id),
    UNIQUE KEY uk_vehicle_body_types_code (code),
    KEY ix_vehicle_body_types_active_sort (is_active, sort_order, display_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE vehicle_drivelines (
    vehicle_driveline_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(64) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    sort_order SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (vehicle_driveline_id),
    UNIQUE KEY uk_vehicle_drivelines_code (code),
    KEY ix_vehicle_drivelines_active_sort (is_active, sort_order, display_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
