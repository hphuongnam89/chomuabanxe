package com.cho2hand.marketplace.service.impl.category;

import com.cho2hand.marketplace.dto.category.CategoryResponse;
import com.cho2hand.marketplace.entity.category.Category;
import com.cho2hand.marketplace.exception.CategoryNotFoundException;
import com.cho2hand.marketplace.mapper.category.CategoryMapper;
import com.cho2hand.marketplace.repository.category.CategoryRepository;
import com.cho2hand.marketplace.service.category.CategoryService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public CategoryServiceImpl(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Override
    public List<CategoryResponse> getTree() {
        var categories = categoryRepository.findByActiveTrueOrderBySortOrderAsc();
        return categories.stream().filter(category -> category.getParentCategoryId() == null)
                .map(category -> toResponse(category, categories)).toList();
    }

    @Override
    public CategoryResponse getBySlug(String slug) {
        var category = categoryRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new CategoryNotFoundException(slug));
        return categoryMapper.toResponse(category, List.of());
    }

    private CategoryResponse toResponse(Category category, List<Category> categories) {
        // ponytail: O(n²) only for the small, three-level category tree; use a parent-id map if the catalogue grows substantially.
        var children = categories.stream().filter(candidate -> category.getId().equals(candidate.getParentCategoryId()))
                .map(child -> toResponse(child, categories)).toList();
        return categoryMapper.toResponse(category, children);
    }
}
