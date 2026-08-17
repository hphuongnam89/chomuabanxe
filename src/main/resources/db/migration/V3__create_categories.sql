CREATE TABLE categories (
    category_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    parent_category_id BIGINT UNSIGNED NULL,
    parent_scope_id BIGINT UNSIGNED AS (IFNULL(parent_category_id, 0)) STORED,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(140) NOT NULL,
    is_leaf BOOLEAN NOT NULL,
    sort_order SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (category_id),
    UNIQUE KEY uk_categories_parent_name (parent_scope_id, name),
    UNIQUE KEY uk_categories_slug (slug),
    KEY ix_categories_leaf_sort (is_leaf, sort_order),
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_category_id) REFERENCES categories (category_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
