package com.cho2hand.marketplace.controller.listing;

import com.cho2hand.marketplace.service.listing.ListingService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ListingControllerTest {
    @Test
    void rejectsAnonymousMineRequest() throws Exception {
        var mvc = MockMvcBuilders.standaloneSetup(new ListingController(mock(ListingService.class))).build();
        mvc.perform(get("/api/v1/listings/mine")).andExpect(status().isUnauthorized());
    }
}
