CREATE TABLE user_statuses (
    user_status_id SMALLINT UNSIGNED NOT NULL,
    code VARCHAR(32) NOT NULL,
    display_name VARCHAR(80) NOT NULL,
    sort_order SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (user_status_id),
    UNIQUE KEY uk_user_statuses_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE roles (
    role_id SMALLINT UNSIGNED NOT NULL,
    code VARCHAR(32) NOT NULL,
    display_name VARCHAR(80) NOT NULL,
    sort_order SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (role_id),
    UNIQUE KEY uk_roles_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE users (
    user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_status_id SMALLINT UNSIGNED NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_media_id BIGINT UNSIGNED NULL,
    joined_at DATETIME(3) NOT NULL,
    last_active_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    PRIMARY KEY (user_id),
    KEY ix_users_joined_at (joined_at),
    CONSTRAINT fk_users_status FOREIGN KEY (user_status_id) REFERENCES user_statuses (user_status_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_auth_identities (
    identity_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    identity_type VARCHAR(16) NOT NULL,
    normalized_value VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NULL,
    verified_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    PRIMARY KEY (identity_id),
    UNIQUE KEY uk_auth_identity_value (identity_type, normalized_value),
    KEY ix_auth_identity_user_verified (user_id, verified_at),
    CONSTRAINT fk_auth_identity_user FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE password_reset_tokens (
    reset_token_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    identity_id BIGINT UNSIGNED NOT NULL,
    token_hash BINARY(32) NOT NULL,
    expires_at DATETIME(3) NOT NULL,
    used_at DATETIME(3) NULL,
    PRIMARY KEY (reset_token_id),
    UNIQUE KEY uk_password_reset_token_hash (token_hash),
    KEY ix_password_reset_tokens_expires_at (expires_at),
    CONSTRAINT fk_reset_token_identity FOREIGN KEY (identity_id) REFERENCES user_auth_identities (identity_id)
        ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_roles (
    user_id BIGINT UNSIGNED NOT NULL,
    role_id SMALLINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (role_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
