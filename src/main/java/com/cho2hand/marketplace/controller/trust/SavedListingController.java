package com.cho2hand.marketplace.controller.trust;

import com.cho2hand.marketplace.service.trust.SavedListingService;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class SavedListingController {
    private final SavedListingService savedListings;
    public SavedListingController(SavedListingService savedListings) { this.savedListings = savedListings; }
    @GetMapping("/saved-listings/ids") public List<Long> ids(@AuthenticationPrincipal Long userId) { return savedListings.ids(userId); }
    @PostMapping("/listings/{listingId}/saved") @ResponseStatus(HttpStatus.CREATED) public void save(@AuthenticationPrincipal Long userId, @PathVariable @Positive Long listingId) { savedListings.save(userId, listingId); }
    @DeleteMapping("/listings/{listingId}/saved") @ResponseStatus(HttpStatus.NO_CONTENT) public void remove(@AuthenticationPrincipal Long userId, @PathVariable @Positive Long listingId) { savedListings.remove(userId, listingId); }
}
