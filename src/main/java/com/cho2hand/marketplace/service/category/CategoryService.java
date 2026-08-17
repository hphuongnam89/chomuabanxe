package com.cho2hand.marketplace.service.category;

import com.cho2hand.marketplace.dto.category.CategoryResponse;
import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getTree();
    CategoryResponse getBySlug(String slug);
}
