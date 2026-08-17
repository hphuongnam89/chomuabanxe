CREATE TABLE comments (
    comment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    listing_id BIGINT UNSIGNED NOT NULL,
    author_user_id BIGINT UNSIGNED NOT NULL,
    parent_comment_id BIGINT UNSIGNED NULL,
    body TEXT NOT NULL,
    status VARCHAR(16) NOT NULL,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    PRIMARY KEY(comment_id),
    KEY ix_comments_listing_status_created(listing_id,status,created_at),
    KEY ix_comments_author_created(author_user_id,created_at DESC),
    CONSTRAINT fk_comments_listing FOREIGN KEY(listing_id) REFERENCES listings(listing_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_comments_author FOREIGN KEY(author_user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_comments_parent FOREIGN KEY(parent_comment_id) REFERENCES comments(comment_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE report_reasons (
    report_reason_id SMALLINT UNSIGNED NOT NULL,
    code VARCHAR(32) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY(report_reason_id), UNIQUE KEY uk_report_reasons_code(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO report_reasons(report_reason_id,code,display_name,is_active) VALUES(1,'SPAM','Spam',TRUE),(2,'FRAUD','Lừa đảo',TRUE),(3,'PROHIBITED','Hàng cấm',TRUE);
CREATE TABLE listing_reports (
    listing_report_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    listing_id BIGINT UNSIGNED NOT NULL,
    reporter_user_id BIGINT UNSIGNED NOT NULL,
    report_reason_id SMALLINT UNSIGNED NOT NULL,
    details VARCHAR(1000) NULL,
    created_at DATETIME(3) NOT NULL,
    PRIMARY KEY(listing_report_id), UNIQUE KEY uk_listing_reports_unique(listing_id,reporter_user_id,report_reason_id), KEY ix_listing_reports_created(created_at),
    CONSTRAINT fk_listing_reports_listing FOREIGN KEY(listing_id) REFERENCES listings(listing_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_listing_reports_reporter FOREIGN KEY(reporter_user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_listing_reports_reason FOREIGN KEY(report_reason_id) REFERENCES report_reasons(report_reason_id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
