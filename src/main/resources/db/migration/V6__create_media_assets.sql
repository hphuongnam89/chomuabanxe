CREATE TABLE media_assets (
    media_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    owner_user_id BIGINT UNSIGNED NOT NULL,
    storage_key VARCHAR(512) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    byte_size BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL,
    PRIMARY KEY (media_id),
    UNIQUE KEY uk_media_assets_storage_key (storage_key),
    KEY ix_media_assets_owner (owner_user_id, created_at DESC),
    CONSTRAINT fk_media_assets_owner FOREIGN KEY (owner_user_id) REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE users ADD CONSTRAINT fk_users_avatar FOREIGN KEY (avatar_media_id) REFERENCES media_assets (media_id) ON DELETE SET NULL ON UPDATE RESTRICT;

CREATE TABLE listing_images (
    listing_id BIGINT UNSIGNED NOT NULL,
    media_id BIGINT UNSIGNED NOT NULL,
    sort_order SMALLINT NOT NULL,
    PRIMARY KEY (listing_id, media_id),
    UNIQUE KEY uk_listing_images_order (listing_id, sort_order),
    CONSTRAINT fk_listing_images_listing FOREIGN KEY (listing_id) REFERENCES listings (listing_id) ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_listing_images_media FOREIGN KEY (media_id) REFERENCES media_assets (media_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
