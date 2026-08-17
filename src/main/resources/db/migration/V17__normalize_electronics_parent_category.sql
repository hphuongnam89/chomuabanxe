UPDATE categories
SET name = 'Đồ điện tử', slug = 'do-dien-tu', parent_category_id = NULL, is_leaf = FALSE, sort_order = 1, is_active = TRUE
WHERE category_id = 1;

INSERT INTO categories (category_id, parent_category_id, name, slug, is_leaf, sort_order, is_active) VALUES
  (2, 1, 'Điện thoại', 'dien-thoai', TRUE, 1, TRUE),
  (8, 1, 'Máy tính bảng', 'may-tinh-bang', TRUE, 2, TRUE),
  (3, 1, 'Laptop', 'laptop', TRUE, 3, TRUE),
  (9, 1, 'Máy tính để bàn', 'may-tinh-de-ban', TRUE, 4, TRUE),
  (10, 1, 'Máy ảnh, Máy quay', 'may-anh-may-quay', TRUE, 5, TRUE),
  (11, 1, 'Tivi, Âm thanh', 'tivi-am-thanh', TRUE, 6, TRUE),
  (12, 1, 'Thiết bị đeo thông minh', 'thiet-bi-deo-thong-minh', TRUE, 7, TRUE),
  (13, 1, 'Phụ kiện (Màn hình, Chuột,...)', 'phu-kien-dien-tu', TRUE, 8, TRUE),
  (14, 1, 'Linh kiện (RAM, Card,...)', 'linh-kien-dien-tu', TRUE, 9, TRUE),
  (19, 1, 'Khác', 'khac', TRUE, 99, TRUE)
ON DUPLICATE KEY UPDATE
  parent_category_id = VALUES(parent_category_id),
  name = VALUES(name),
  slug = VALUES(slug),
  is_leaf = VALUES(is_leaf),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active);
