package com.cho2hand.marketplace.dto.admin;
import java.time.Instant;
public record AdminReviewResponse(Long id,Long transactionId,Long listingId,Long buyerId,Long sellerId,String sellerName,
        short rating,String body,String status,Instant createdAt){}
