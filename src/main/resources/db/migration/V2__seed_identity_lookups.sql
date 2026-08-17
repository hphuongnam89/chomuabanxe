INSERT INTO user_statuses (user_status_id, code, display_name, sort_order, is_active) VALUES
    (1, 'ACTIVE', 'Hoạt động', 1, TRUE),
    (2, 'SUSPENDED', 'Tạm khóa', 2, TRUE),
    (3, 'DELETED', 'Đã xóa', 3, TRUE);

INSERT INTO roles (role_id, code, display_name, sort_order, is_active) VALUES
    (1, 'USER', 'Người dùng', 1, TRUE),
    (2, 'MODERATOR', 'Kiểm duyệt viên', 2, TRUE),
    (3, 'ADMIN', 'Quản trị viên', 3, TRUE);
