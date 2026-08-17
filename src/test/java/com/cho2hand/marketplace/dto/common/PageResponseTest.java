package com.cho2hand.marketplace.dto.common;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

class PageResponseTest {
    @Test void preservesTheExistingFrontendPaginationContract() {
        var response = PageResponse.from(new PageImpl<>(List.of("xe"), PageRequest.of(1, 1), 3));

        assertEquals(List.of("xe"), response.content());
        assertEquals(1, response.number());
        assertEquals(3, response.totalPages());
        assertFalse(response.first());
        assertFalse(response.last());
    }
}
