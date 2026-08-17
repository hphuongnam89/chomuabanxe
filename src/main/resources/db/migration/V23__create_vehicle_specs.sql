CREATE TABLE vehicle_specs (
    listing_id BIGINT UNSIGNED NOT NULL,
    vehicle_brand_id BIGINT UNSIGNED NOT NULL,
    vehicle_model_id BIGINT UNSIGNED NOT NULL,
    manufacture_year SMALLINT UNSIGNED NOT NULL,
    vehicle_transmission_id BIGINT UNSIGNED NOT NULL,
    vehicle_fuel_id BIGINT UNSIGNED NOT NULL,
    vehicle_origin_id BIGINT UNSIGNED NOT NULL,
    vehicle_color_id BIGINT UNSIGNED NOT NULL,
    vehicle_body_type_id BIGINT UNSIGNED NOT NULL,
    seat_count TINYINT UNSIGNED NOT NULL,
    vehicle_driveline_id BIGINT UNSIGNED NOT NULL,
    mileage_km INT UNSIGNED NULL,
    PRIMARY KEY (listing_id),
    KEY ix_vehicle_specs_brand_year (vehicle_brand_id, manufacture_year),
    KEY ix_vehicle_specs_model (vehicle_model_id),
    KEY ix_vehicle_specs_filters (vehicle_transmission_id, vehicle_fuel_id, vehicle_origin_id),
    KEY ix_vehicle_specs_body_color (vehicle_body_type_id, vehicle_color_id),
    CONSTRAINT chk_vehicle_specs_year CHECK (manufacture_year BETWEEN 1886 AND 2100),
    CONSTRAINT chk_vehicle_specs_seats CHECK (seat_count BETWEEN 1 AND 50),
    CONSTRAINT chk_vehicle_specs_mileage CHECK (mileage_km IS NULL OR mileage_km >= 0),
    CONSTRAINT fk_vehicle_specs_listing FOREIGN KEY (listing_id) REFERENCES listings (listing_id)
        ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_vehicle_specs_brand FOREIGN KEY (vehicle_brand_id) REFERENCES vehicle_brands (vehicle_brand_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_vehicle_specs_model_brand FOREIGN KEY (vehicle_model_id, vehicle_brand_id)
        REFERENCES vehicle_models (vehicle_model_id, vehicle_brand_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_vehicle_specs_transmission FOREIGN KEY (vehicle_transmission_id) REFERENCES vehicle_transmissions (vehicle_transmission_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_vehicle_specs_fuel FOREIGN KEY (vehicle_fuel_id) REFERENCES vehicle_fuels (vehicle_fuel_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_vehicle_specs_origin FOREIGN KEY (vehicle_origin_id) REFERENCES vehicle_origins (vehicle_origin_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_vehicle_specs_color FOREIGN KEY (vehicle_color_id) REFERENCES vehicle_colors (vehicle_color_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_vehicle_specs_body_type FOREIGN KEY (vehicle_body_type_id) REFERENCES vehicle_body_types (vehicle_body_type_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_vehicle_specs_driveline FOREIGN KEY (vehicle_driveline_id) REFERENCES vehicle_drivelines (vehicle_driveline_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
