CREATE TABLE saved_listings (
    user_id BIGINT UNSIGNED NOT NULL,
    listing_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL,
    PRIMARY KEY (user_id, listing_id),
    KEY ix_saved_listings_user_created (user_id, created_at DESC),
    CONSTRAINT fk_saved_listings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_saved_listings_listing FOREIGN KEY (listing_id) REFERENCES listings(listing_id) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE listing_transactions
    ADD COLUMN seller_confirmed_at DATETIME(3) NULL AFTER confirmed_at,
    ADD COLUMN buyer_confirmed_at DATETIME(3) NULL AFTER seller_confirmed_at;

UPDATE listing_transactions
SET seller_confirmed_at = confirmed_at, buyer_confirmed_at = confirmed_at
WHERE status = 'CONFIRMED';
