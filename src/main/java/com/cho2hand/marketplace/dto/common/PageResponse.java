package com.cho2hand.marketplace.dto.common;

import java.util.List;
import org.springframework.data.domain.Page;

public record PageResponse<T>(List<T> content, int number, int size, long totalElements, int totalPages,
        boolean first, boolean last, boolean empty, int numberOfElements) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(),
                page.getTotalPages(), page.isFirst(), page.isLast(), page.isEmpty(), page.getNumberOfElements());
    }
}
