-- Keep legacy category rows for existing foreign keys; only expose CarX categories.
UPDATE categories
SET is_active = FALSE
WHERE category_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 19);

INSERT INTO categories (category_id, parent_category_id, name, slug, is_leaf, sort_order, is_active) VALUES
  (20, NULL, 'Xe ô tô', 'xe-o-to', FALSE, 1, TRUE),
  (21, 20, 'Sedan', 'sedan', TRUE, 1, TRUE),
  (22, 20, 'SUV / CUV', 'suv-cuv', TRUE, 2, TRUE),
  (23, 20, 'Hatchback', 'hatchback', TRUE, 3, TRUE),
  (24, 20, 'MPV', 'mpv', TRUE, 4, TRUE),
  (25, 20, 'Bán tải', 'ban-tai', TRUE, 5, TRUE),
  (26, 20, 'Coupe', 'coupe', TRUE, 6, TRUE),
  (27, 20, 'Mui trần', 'mui-tran', TRUE, 7, TRUE),
  (28, 20, 'Xe điện', 'xe-dien', TRUE, 8, TRUE),
  (29, 20, 'Xe sang', 'xe-sang', TRUE, 9, TRUE),
  (30, 20, 'Khác', 'khac-xe', TRUE, 99, TRUE)
ON DUPLICATE KEY UPDATE
  parent_category_id = VALUES(parent_category_id),
  name = VALUES(name),
  slug = VALUES(slug),
  is_leaf = VALUES(is_leaf),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active);
