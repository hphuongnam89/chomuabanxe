package com.cho2hand.marketplace.controller.listing;

import com.cho2hand.marketplace.dto.listing.*;
import com.cho2hand.marketplace.service.listing.ListingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/listings")
public class ListingController {
    private final ListingService service;

    public ListingController(ListingService service) { this.service = service; }

    @GetMapping
    public Page<ListingResponse> search(
            @RequestParam(required = false) @Size(max = 120) String keyword,
            @RequestParam(required = false) @Positive Long categoryId,
            @RequestParam(required = false) @Positive Long conditionId,
            @RequestParam(required = false) @Positive Long locationId,
            @RequestParam(required = false) @Positive Long sellerUserId,
            @RequestParam(required = false) @DecimalMin("0") BigDecimal minPrice,
            @RequestParam(required = false) @DecimalMin("0") BigDecimal maxPrice,
            @RequestParam(required = false) @Positive Long brandId,
            @RequestParam(required = false) @Positive Long modelId,
            @RequestParam(required = false) @Min(1886) Integer minYear,
            @RequestParam(required = false) @Min(1886) Integer maxYear,
            @RequestParam(required = false) @Positive Long transmissionId,
            @RequestParam(required = false) @Positive Long fuelId,
            @RequestParam(required = false) @Positive Long originId,
            @RequestParam(required = false) @Positive Long colorId,
            @RequestParam(required = false) @Positive Long bodyTypeId,
            @RequestParam(required = false) @Min(1) @Max(50) Integer seatCount,
            @RequestParam(required = false) @Positive Long drivelineId,
            @RequestParam(required = false) @PositiveOrZero Integer minMileageKm,
            @RequestParam(required = false) @PositiveOrZero Integer maxMileageKm,
            @RequestParam(required = false) @Size(max = 32) String sort,
            @RequestParam(defaultValue = "0") @PositiveOrZero int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return service.search(new ListingSearchRequest(keyword, categoryId, conditionId, locationId, sellerUserId, minPrice, maxPrice,
                brandId, modelId, minYear, maxYear, transmissionId, fuelId, originId, colorId, bodyTypeId, seatCount,
                drivelineId, minMileageKm, maxMileageKm, null, sort, page, size));
    }

    @GetMapping("/recommendations")
    public Page<ListingResponse> recommendations(
            @RequestParam(required = false) @Positive Long brandId,
            @RequestParam(required = false) @Positive Long modelId,
            @RequestParam(required = false) @DecimalMin("0") BigDecimal minPrice,
            @RequestParam(required = false) @DecimalMin("0") BigDecimal maxPrice,
            @RequestParam(required = false) @Positive Long locationId,
            @RequestParam(required = false) @Positive Long excludeId,
            @RequestParam(defaultValue = "0") @PositiveOrZero int page,
            @RequestParam(defaultValue = "8") @Min(1) @Max(20) int size) {
        return service.recommendations(brandId, modelId, minPrice, maxPrice, locationId, excludeId, page, size);
    }

    @GetMapping("/mine")
    public Page<ListingResponse> mine(@AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "0") @PositiveOrZero int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        return service.mine(userId, page, size);
    }

    @GetMapping("/{id}")
    public ListingResponse get(@PathVariable @Positive Long id) { return service.get(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ListingResponse create(@AuthenticationPrincipal Long userId, @Valid @RequestBody CreateListingRequest request) {
        return service.create(userId, request);
    }

    @PatchMapping("/{id}")
    public ListingResponse update(@AuthenticationPrincipal Long userId, @PathVariable @Positive Long id,
            @Valid @RequestBody UpdateListingRequest request) {
        return service.update(userId, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archive(@AuthenticationPrincipal Long userId, @PathVariable @Positive Long id) { service.archive(userId, id); }
}
