ALTER TABLE user_auth_identities
    ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0;

ALTER TABLE user_auth_identities
    ADD COLUMN locked_until DATETIME(6) NULL;

CREATE INDEX idx_user_auth_identities_locked_until
    ON user_auth_identities (locked_until);
