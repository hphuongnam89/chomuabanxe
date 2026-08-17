package com.cho2hand.marketplace.service.impl.trust;

import com.cho2hand.marketplace.dto.trust.*;
import com.cho2hand.marketplace.entity.trust.*;
import com.cho2hand.marketplace.exception.*;
import com.cho2hand.marketplace.repository.listing.*;
import com.cho2hand.marketplace.repository.chat.ConversationRepository;
import com.cho2hand.marketplace.repository.trust.*;
import com.cho2hand.marketplace.service.notification.NotificationService;
import com.cho2hand.marketplace.service.trust.TransactionService;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TransactionServiceImpl implements TransactionService {
    private final ListingRepository listings;
    private final ListingStatusRepository statuses;
    private final ListingTransactionRepository transactions;
    private final SellerReviewRepository reviews;
    private final NotificationService notifications;
    private final ConversationRepository conversations;

    public TransactionServiceImpl(ListingRepository listings, ListingStatusRepository statuses,
            ListingTransactionRepository transactions, SellerReviewRepository reviews, NotificationService notifications, ConversationRepository conversations) {
        this.listings = listings; this.statuses = statuses; this.transactions = transactions; this.reviews = reviews; this.notifications = notifications; this.conversations = conversations;
    }

    public TransactionResponse confirm(Long seller, Long listingId, ConfirmTransactionRequest request) {
        var listing = listings.findById(listingId).orElseThrow(() -> new ListingNotFoundException(listingId));
        if (!seller.equals(listing.getSellerUserId()) || seller.equals(request.buyerUserId())) throw new ListingAccessDeniedException();
        if (conversations.findByListingIdAndBuyerUserIdAndSellerUserId(listingId, request.buyerUserId(), seller).isEmpty()) throw new ListingAccessDeniedException();
        var transaction = transactions.findByListingIdAndBuyerUserId(listingId, request.buyerUserId()).orElseGet(() -> {
            var value = new ListingTransaction(); value.setListingId(listingId); value.setBuyerUserId(request.buyerUserId()); return value;
        });
        if (transaction.getSellerConfirmedAt() == null) {
            transaction.setSellerConfirmedAt(Instant.now()); transaction.setStatus("PENDING_BUYER_CONFIRM");
            listing.setListingStatusId(soldStatus().getId());
            notifications.create(request.buyerUserId(), "TRANSACTION", "Người bán đã đánh dấu giao dịch hoàn tất. Hãy xác nhận khi bạn đã nhận hàng.", "/danh-gia");
        }
        return response(transactions.save(transaction));
    }

    public TransactionResponse confirmReceipt(Long buyer, Long transactionId) {
        var transaction = transactions.findById(transactionId).filter(value -> buyer.equals(value.getBuyerUserId()) && "PENDING_BUYER_CONFIRM".equals(value.getStatus()))
                .orElseThrow(() -> new TransactionNotFoundException(transactionId));
        var now = Instant.now();
        transaction.setBuyerConfirmedAt(now); transaction.setConfirmedAt(now); transaction.setStatus("CONFIRMED");
        var listing = listings.findById(transaction.getListingId()).orElseThrow(() -> new ListingNotFoundException(transaction.getListingId()));
        notifications.create(listing.getSellerUserId(), "TRANSACTION", "Người mua đã xác nhận giao dịch hoàn tất.", "/tin-cua-toi");
        return response(transaction);
    }

    @Transactional(readOnly = true)
    public java.util.List<TransactionResponse> mine(Long buyer) {
        return transactions.findByBuyerUserIdOrderByConfirmedAtDesc(buyer).stream().map(this::response).toList();
    }

    public void review(Long buyer, Long transactionId, CreateReviewRequest request) {
        var transaction = transactions.findById(transactionId).filter(value -> buyer.equals(value.getBuyerUserId()) && "CONFIRMED".equals(value.getStatus()))
                .orElseThrow(() -> new TransactionNotFoundException(transactionId));
        if (reviews.existsByTransactionId(transaction.getId())) throw new DuplicateReviewException();
        var review = new SellerReview(); review.setTransactionId(transaction.getId()); review.setRating(request.rating()); review.setBody(request.body()); reviews.save(review);
    }

    private TransactionResponse response(ListingTransaction transaction) {
        return new TransactionResponse(transaction.getId(), transaction.getListingId(), transaction.getStatus(),
                transaction.getSellerConfirmedAt(), transaction.getBuyerConfirmedAt(), transaction.getConfirmedAt(), reviews.existsByTransactionId(transaction.getId()));
    }

    private com.cho2hand.marketplace.entity.listing.ListingStatus soldStatus() {
        return statuses.findByCodeAndActiveTrue("SOLD").orElseThrow(() -> new LookupValueNotFoundException("Listing status", "SOLD"));
    }
}
