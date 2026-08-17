package com.cho2hand.marketplace.controller.category;

import com.cho2hand.marketplace.dto.category.CategoryResponse;
import com.cho2hand.marketplace.service.category.CategoryService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {
    private final CategoryService categoryService;
    public CategoryController(CategoryService categoryService) { this.categoryService = categoryService; }

    @GetMapping
    public List<CategoryResponse> getTree() { return categoryService.getTree(); }

    @GetMapping("/{slug}")
    public CategoryResponse getBySlug(@PathVariable String slug) { return categoryService.getBySlug(slug); }
}
