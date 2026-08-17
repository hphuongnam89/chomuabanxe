CREATE TABLE notifications (
    notification_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    recipient_user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(32) NOT NULL,
    body VARCHAR(500) NOT NULL,
    reference_path VARCHAR(255) NULL,
    read_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL,
    PRIMARY KEY (notification_id),
    KEY ix_notifications_recipient_read_created (recipient_user_id, read_at, created_at DESC),
    CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_user_id) REFERENCES users (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
