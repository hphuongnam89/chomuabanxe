ALTER TABLE users DROP FOREIGN KEY fk_users_status;
ALTER TABLE user_roles DROP FOREIGN KEY fk_user_roles_role;
ALTER TABLE listings DROP FOREIGN KEY fk_listings_status;
ALTER TABLE listings DROP FOREIGN KEY fk_listings_condition;
ALTER TABLE listing_reports DROP FOREIGN KEY fk_listing_reports_reason;

ALTER TABLE user_statuses MODIFY user_status_id BIGINT UNSIGNED NOT NULL;
ALTER TABLE roles MODIFY role_id BIGINT UNSIGNED NOT NULL;
ALTER TABLE users MODIFY user_status_id BIGINT UNSIGNED NOT NULL;
ALTER TABLE user_roles MODIFY role_id BIGINT UNSIGNED NOT NULL;
ALTER TABLE listing_statuses MODIFY listing_status_id BIGINT UNSIGNED NOT NULL;
ALTER TABLE conditions MODIFY condition_id BIGINT UNSIGNED NOT NULL;
ALTER TABLE listings MODIFY listing_status_id BIGINT UNSIGNED NOT NULL, MODIFY condition_id BIGINT UNSIGNED NOT NULL;
ALTER TABLE report_reasons MODIFY report_reason_id BIGINT UNSIGNED NOT NULL;
ALTER TABLE listing_reports MODIFY report_reason_id BIGINT UNSIGNED NOT NULL;

ALTER TABLE users ADD CONSTRAINT fk_users_status FOREIGN KEY (user_status_id) REFERENCES user_statuses (user_status_id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (role_id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE listings ADD CONSTRAINT fk_listings_status FOREIGN KEY (listing_status_id) REFERENCES listing_statuses (listing_status_id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE listings ADD CONSTRAINT fk_listings_condition FOREIGN KEY (condition_id) REFERENCES conditions (condition_id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE listing_reports ADD CONSTRAINT fk_listing_reports_reason FOREIGN KEY (report_reason_id) REFERENCES report_reasons (report_reason_id) ON DELETE RESTRICT ON UPDATE RESTRICT;
