INSERT INTO permissions (permission_id, code, display_name, is_active) VALUES
    (1, 'customer.read', 'Xem khách hàng', TRUE),
    (2, 'customer.update_status', 'Cập nhật trạng thái khách hàng', TRUE),
    (3, 'listing.read_admin', 'Xem tin trong quản trị', TRUE),
    (4, 'listing.moderate', 'Kiểm duyệt tin', TRUE),
    (5, 'vehicle_catalog.read', 'Xem catalog xe', TRUE),
    (6, 'vehicle_catalog.write', 'Cập nhật catalog xe', TRUE),
    (7, 'location.write', 'Cập nhật khu vực', TRUE),
    (8, 'staff.read', 'Xem nhân viên', TRUE),
    (9, 'staff.write', 'Quản lý nhân viên', TRUE),
    (10, 'audit.read', 'Xem nhật ký quản trị', TRUE),
    (11, 'system.read', 'Xem vận hành hệ thống', TRUE)
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), is_active = VALUES(is_active);
