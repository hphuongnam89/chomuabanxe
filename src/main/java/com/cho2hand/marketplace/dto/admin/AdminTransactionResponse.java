package com.cho2hand.marketplace.dto.admin;
import java.time.Instant;
public record AdminTransactionResponse(Long id,Long listingId,String listingTitle,Long buyerId,String buyerName,
        Long sellerId,String sellerName,String status,Instant sellerConfirmedAt,Instant buyerConfirmedAt,Instant confirmedAt){}
