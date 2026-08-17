CREATE TABLE conversations (
    conversation_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    listing_id BIGINT UNSIGNED NOT NULL,
    buyer_user_id BIGINT UNSIGNED NOT NULL,
    seller_user_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(16) NOT NULL,
    last_message_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    PRIMARY KEY (conversation_id),
    UNIQUE KEY uk_conversations_participants (listing_id,buyer_user_id,seller_user_id),
    KEY ix_conversations_seller_updated (seller_user_id,updated_at DESC),
    KEY ix_conversations_buyer_last_message (buyer_user_id,last_message_at DESC),
    CONSTRAINT fk_conversations_listing FOREIGN KEY (listing_id) REFERENCES listings(listing_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_conversations_buyer FOREIGN KEY (buyer_user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_conversations_seller FOREIGN KEY (seller_user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE messages (
    message_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender_user_id BIGINT UNSIGNED NOT NULL,
    body TEXT NOT NULL,
    sent_at DATETIME(3) NOT NULL,
    read_at DATETIME(3) NULL,
    status VARCHAR(16) NOT NULL,
    PRIMARY KEY(message_id), KEY ix_messages_conversation_sent(conversation_id,sent_at), KEY ix_messages_conversation_status(conversation_id,status),
    CONSTRAINT fk_messages_conversation FOREIGN KEY(conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_messages_sender FOREIGN KEY(sender_user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
