INSERT INTO vehicle_brands (code, name, sort_order, is_active) VALUES
    ('toyota', 'Toyota', 1, TRUE),
    ('honda', 'Honda', 2, TRUE),
    ('hyundai', 'Hyundai', 3, TRUE),
    ('kia', 'Kia', 4, TRUE),
    ('mazda', 'Mazda', 5, TRUE),
    ('ford', 'Ford', 6, TRUE),
    ('mitsubishi', 'Mitsubishi', 7, TRUE),
    ('vinfast', 'VinFast', 8, TRUE),
    ('mercedes-benz', 'Mercedes-Benz', 9, TRUE),
    ('bmw', 'BMW', 10, TRUE);

INSERT INTO vehicle_models (vehicle_brand_id, code, name, sort_order, is_active)
SELECT b.vehicle_brand_id, m.code, m.name, m.sort_order, TRUE
FROM vehicle_brands b
JOIN (
    SELECT 'toyota' AS brand_code, 'vios' AS code, 'Vios' AS name, 1 AS sort_order
    UNION ALL SELECT 'toyota', 'corolla-cross', 'Corolla Cross', 2
    UNION ALL SELECT 'honda', 'city', 'City', 1
    UNION ALL SELECT 'honda', 'cr-v', 'CR-V', 2
    UNION ALL SELECT 'hyundai', 'accent', 'Accent', 1
    UNION ALL SELECT 'hyundai', 'tucson', 'Tucson', 2
    UNION ALL SELECT 'kia', 'morning', 'Morning', 1
    UNION ALL SELECT 'kia', 'seltos', 'Seltos', 2
    UNION ALL SELECT 'mazda', 'mazda3', 'Mazda 3', 1
    UNION ALL SELECT 'mazda', 'cx-5', 'CX-5', 2
    UNION ALL SELECT 'ford', 'ranger', 'Ranger', 1
    UNION ALL SELECT 'ford', 'everest', 'Everest', 2
    UNION ALL SELECT 'mitsubishi', 'attrage', 'Attrage', 1
    UNION ALL SELECT 'mitsubishi', 'xpander', 'Xpander', 2
    UNION ALL SELECT 'vinfast', 'fadil', 'Fadil', 1
    UNION ALL SELECT 'vinfast', 'vf8', 'VF 8', 2
    UNION ALL SELECT 'mercedes-benz', 'c-class', 'C-Class', 1
    UNION ALL SELECT 'mercedes-benz', 'e-class', 'E-Class', 2
    UNION ALL SELECT 'bmw', '3-series', '3 Series', 1
    UNION ALL SELECT 'bmw', '5-series', '5 Series', 2
) m ON m.brand_code = b.code;

INSERT INTO vehicle_origins (code, display_name, sort_order, is_active) VALUES
    ('vietnam', 'Việt Nam', 1, TRUE),
    ('thailand', 'Thái Lan', 2, TRUE),
    ('indonesia', 'Indonesia', 3, TRUE),
    ('japan', 'Nhật Bản', 4, TRUE),
    ('korea', 'Hàn Quốc', 5, TRUE),
    ('usa', 'Hoa Kỳ', 6, TRUE),
    ('germany', 'Đức', 7, TRUE),
    ('other', 'Khác', 99, TRUE);

INSERT INTO vehicle_transmissions (code, display_name, sort_order, is_active) VALUES
    ('automatic', 'Tự động', 1, TRUE),
    ('manual', 'Số sàn', 2, TRUE),
    ('cvt', 'CVT', 3, TRUE),
    ('dct', 'Ly hợp kép', 4, TRUE);

INSERT INTO vehicle_fuels (code, display_name, sort_order, is_active) VALUES
    ('gasoline', 'Xăng', 1, TRUE),
    ('diesel', 'Dầu diesel', 2, TRUE),
    ('hybrid', 'Hybrid', 3, TRUE),
    ('electric', 'Điện', 4, TRUE);

INSERT INTO vehicle_colors (code, display_name, sort_order, is_active) VALUES
    ('white', 'Trắng', 1, TRUE),
    ('black', 'Đen', 2, TRUE),
    ('silver', 'Bạc', 3, TRUE),
    ('gray', 'Xám', 4, TRUE),
    ('red', 'Đỏ', 5, TRUE),
    ('blue', 'Xanh dương', 6, TRUE),
    ('other', 'Khác', 99, TRUE);

INSERT INTO vehicle_body_types (code, display_name, sort_order, is_active) VALUES
    ('sedan', 'Sedan', 1, TRUE),
    ('hatchback', 'Hatchback', 2, TRUE),
    ('suv', 'SUV', 3, TRUE),
    ('cuv', 'CUV', 4, TRUE),
    ('mpv', 'MPV', 5, TRUE),
    ('pickup', 'Bán tải', 6, TRUE),
    ('coupe', 'Coupe', 7, TRUE),
    ('convertible', 'Mui trần', 8, TRUE);

INSERT INTO vehicle_drivelines (code, display_name, sort_order, is_active) VALUES
    ('fwd', 'Cầu trước', 1, TRUE),
    ('rwd', 'Cầu sau', 2, TRUE),
    ('awd', 'Hai cầu toàn thời gian', 3, TRUE),
    ('4wd', 'Hai cầu bán thời gian', 4, TRUE);
