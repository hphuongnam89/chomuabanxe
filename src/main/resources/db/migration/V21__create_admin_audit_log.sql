CREATE TABLE admin_audit_logs (
    audit_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    admin_user_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(32) NOT NULL,
    target_id BIGINT UNSIGNED NULL,
    details VARCHAR(500) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (audit_id),
    KEY idx_admin_audit_created (created_at),
    KEY idx_admin_audit_admin_created (admin_user_id, created_at),
    CONSTRAINT fk_admin_audit_user FOREIGN KEY (admin_user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
);
