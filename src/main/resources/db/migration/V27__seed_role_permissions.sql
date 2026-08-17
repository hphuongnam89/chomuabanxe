INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, permission_id FROM permissions WHERE code IN ('customer.read', 'customer.update_status')
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT 5, permission_id FROM permissions WHERE code IN ('listing.read_admin', 'listing.moderate', 'vehicle_catalog.read', 'vehicle_catalog.write')
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, permission_id FROM permissions
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);
