package com.cho2hand.marketplace.repository.category;

import com.cho2hand.marketplace.entity.category.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByActiveTrueOrderBySortOrderAsc();
    Optional<Category> findBySlugAndActiveTrue(String slug);
    Optional<Category> findByIdAndActiveTrue(Long id);
    boolean existsBySlug(String slug);
    List<Category> findAllByOrderBySortOrderAscNameAsc();
}
