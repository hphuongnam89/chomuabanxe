CREATE TABLE seller_follows (
    follower_user_id BIGINT UNSIGNED NOT NULL,
    seller_user_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL,
    PRIMARY KEY (follower_user_id,seller_user_id),
    KEY ix_seller_follows_seller_created (seller_user_id,created_at DESC),
    CONSTRAINT chk_seller_follows_distinct CHECK (follower_user_id <> seller_user_id),
    CONSTRAINT fk_seller_follows_follower FOREIGN KEY(follower_user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_seller_follows_seller FOREIGN KEY(seller_user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE listing_transactions (
    transaction_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    listing_id BIGINT UNSIGNED NOT NULL,
    buyer_user_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(16) NOT NULL,
    confirmed_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL,
    PRIMARY KEY(transaction_id), UNIQUE KEY uk_listing_transactions_listing_buyer(listing_id,buyer_user_id),
    KEY ix_listing_transactions_buyer_status_confirmed(buyer_user_id,status,confirmed_at),
    CONSTRAINT fk_transactions_listing FOREIGN KEY(listing_id) REFERENCES listings(listing_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_transactions_buyer FOREIGN KEY(buyer_user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE seller_reviews (
    review_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    transaction_id BIGINT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    body TEXT NULL,
    status VARCHAR(16) NOT NULL,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    PRIMARY KEY(review_id), UNIQUE KEY uk_seller_reviews_transaction(transaction_id), KEY ix_seller_reviews_status_created(status,created_at),
    CONSTRAINT chk_seller_reviews_rating CHECK(rating BETWEEN 1 AND 5),
    CONSTRAINT fk_seller_reviews_transaction FOREIGN KEY(transaction_id) REFERENCES listing_transactions(transaction_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
