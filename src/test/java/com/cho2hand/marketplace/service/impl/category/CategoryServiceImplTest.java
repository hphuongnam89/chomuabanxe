package com.cho2hand.marketplace.service.impl.category;

import com.cho2hand.marketplace.entity.category.Category;
import com.cho2hand.marketplace.mapper.category.CategoryMapper;
import com.cho2hand.marketplace.repository.category.CategoryRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CategoryServiceImplTest {
    @Test
    void returnsNestedActiveCategories() {
        var repository = mock(CategoryRepository.class);
        when(repository.findByActiveTrueOrderBySortOrderAsc()).thenReturn(List.of(category(1L, null, "Điện tử"), category(2L, 1L, "Điện thoại")));
        var service = new CategoryServiceImpl(repository, new CategoryMapper());

        var result = service.getTree();

        assertEquals(1, result.size());
        assertEquals("Điện thoại", result.getFirst().children().getFirst().name());
    }

    private Category category(Long id, Long parentId, String name) {
        var category = new Category();
        ReflectionTestUtils.setField(category, "id", id);
        ReflectionTestUtils.setField(category, "parentCategoryId", parentId);
        ReflectionTestUtils.setField(category, "name", name);
        ReflectionTestUtils.setField(category, "slug", name.toLowerCase());
        ReflectionTestUtils.setField(category, "active", true);
        return category;
    }
}
