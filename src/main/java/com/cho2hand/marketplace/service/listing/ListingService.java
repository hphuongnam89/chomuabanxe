package com.cho2hand.marketplace.service.listing;
import com.cho2hand.marketplace.dto.listing.*;
import org.springframework.data.domain.Page;
import java.math.BigDecimal;
public interface ListingService {
    ListingResponse create(Long sellerId, CreateListingRequest request);
    ListingResponse get(Long id);
    ListingResponse update(Long sellerId, Long id, UpdateListingRequest request);
    void archive(Long sellerId, Long id);
    Page<ListingResponse> mine(Long sellerId, int page, int size);
    Page<ListingResponse> search(ListingSearchRequest request);
    Page<ListingResponse> recommendations(Long brandId, Long modelId, BigDecimal minPrice, BigDecimal maxPrice,
            Long locationId, Long excludeId, int page, int size);
}
