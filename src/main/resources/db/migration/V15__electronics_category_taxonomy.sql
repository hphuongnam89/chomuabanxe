UPDATE categories
SET name = 'Điện thoại', slug = 'dien-thoai', parent_category_id = 1, is_leaf = TRUE, sort_order = 1, is_active = TRUE
WHERE category_id = 2;

UPDATE categories
SET name = 'Laptop', slug = 'laptop', parent_category_id = 1, is_leaf = TRUE, sort_order = 3, is_active = TRUE
WHERE category_id = 3;

INSERT INTO categories (category_id, parent_category_id, name, slug, is_leaf, sort_order, is_active) VALUES
  (8, 1, 'Máy tính bảng', 'may-tinh-bang', TRUE, 2, TRUE),
  (9, 1, 'Máy tính để bàn', 'may-tinh-de-ban', TRUE, 4, TRUE),
  (10, 1, 'Máy ảnh, Máy quay', 'may-anh-may-quay', TRUE, 5, TRUE),
  (11, 1, 'Tivi, Âm thanh', 'tivi-am-thanh', TRUE, 6, TRUE),
  (12, 1, 'Thiết bị đeo thông minh', 'thiet-bi-deo-thong-minh', TRUE, 7, TRUE),
  (13, 1, 'Phụ kiện', 'phu-kien-dien-tu', TRUE, 8, TRUE),
  (14, 1, 'Linh kiện', 'linh-kien-dien-tu', TRUE, 9, TRUE),
  (19, 1, 'Khác', 'khac', TRUE, 99, TRUE)
ON DUPLICATE KEY UPDATE
  parent_category_id = VALUES(parent_category_id),
  name = VALUES(name),
  slug = VALUES(slug),
  is_leaf = VALUES(is_leaf),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active);

UPDATE listings SET category_id = 19 WHERE category_id IN (5, 7);

UPDATE categories SET is_active = FALSE WHERE category_id IN (4, 5, 6, 7);
