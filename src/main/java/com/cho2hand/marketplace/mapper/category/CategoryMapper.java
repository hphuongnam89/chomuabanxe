package com.cho2hand.marketplace.mapper.category;

import com.cho2hand.marketplace.dto.category.CategoryResponse;
import com.cho2hand.marketplace.entity.category.Category;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {
    public CategoryResponse toResponse(Category category, List<CategoryResponse> children) {
        return new CategoryResponse(category.getId(), category.getName(), category.getSlug(), category.isLeaf(), children);
    }
}
