package com.cho2hand.marketplace.dto.listing;

import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;

class UpdateListingRequestValidationTest {
    @Test
    void rejectsWhitespaceOnlyText() {
        var request = new UpdateListingRequest(null, null, null, "  ", "\n\t", null, " ", null);
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            assertFalse(factory.getValidator().validate(request).isEmpty());
        }
    }
}
