ALTER TABLE listing_reports
    ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT 'OPEN' AFTER details,
    ADD COLUMN resolution_note TEXT NULL AFTER status,
    ADD COLUMN resolved_at DATETIME(3) NULL AFTER resolution_note,
    ADD COLUMN resolved_by_user_id BIGINT UNSIGNED NULL AFTER resolved_at,
    ADD KEY ix_listing_reports_status_created (status, created_at DESC),
    ADD CONSTRAINT fk_listing_reports_resolved_by FOREIGN KEY (resolved_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE RESTRICT;
