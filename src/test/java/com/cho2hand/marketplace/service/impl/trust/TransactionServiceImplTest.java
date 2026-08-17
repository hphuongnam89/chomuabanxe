package com.cho2hand.marketplace.service.impl.trust;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import com.cho2hand.marketplace.dto.trust.ConfirmTransactionRequest;
import com.cho2hand.marketplace.entity.listing.Listing;
import com.cho2hand.marketplace.exception.ListingAccessDeniedException;
import com.cho2hand.marketplace.repository.chat.ConversationRepository;
import com.cho2hand.marketplace.repository.listing.ListingRepository;
import com.cho2hand.marketplace.repository.listing.ListingStatusRepository;
import com.cho2hand.marketplace.repository.trust.ListingTransactionRepository;
import com.cho2hand.marketplace.repository.trust.SellerReviewRepository;
import com.cho2hand.marketplace.service.notification.NotificationService;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class TransactionServiceImplTest {
    @Test
    void requiresAConversationBeforeSellerCanConfirmTransaction() {
        var listings = mock(ListingRepository.class);
        var listing = new Listing(); listing.setSellerUserId(7L);
        when(listings.findById(1L)).thenReturn(Optional.of(listing));
        var service = new TransactionServiceImpl(listings, mock(ListingStatusRepository.class), mock(ListingTransactionRepository.class),
                mock(SellerReviewRepository.class), mock(NotificationService.class), mock(ConversationRepository.class));
        assertThrows(ListingAccessDeniedException.class, () -> service.confirm(7L, 1L, new ConfirmTransactionRequest(8L)));
    }
}
