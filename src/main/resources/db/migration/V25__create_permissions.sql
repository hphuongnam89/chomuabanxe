CREATE TABLE permissions (
    permission_id SMALLINT UNSIGNED NOT NULL,
    code VARCHAR(64) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (permission_id),
    UNIQUE KEY uk_permissions_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE role_permissions (
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles (role_id)
        ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions (permission_id)
        ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO roles (role_id, code, display_name, sort_order, is_active) VALUES
    (4, 'STAFF_CUSTOMER', 'Nhân viên khách hàng', 4, TRUE),
    (5, 'STAFF_CONTENT', 'Nhân viên nội dung', 5, TRUE)
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), sort_order = VALUES(sort_order), is_active = VALUES(is_active);
