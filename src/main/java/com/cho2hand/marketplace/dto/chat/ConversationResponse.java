package com.cho2hand.marketplace.dto.chat; import java.time.Instant; public record ConversationResponse(Long id,Long listingId,Long buyerUserId,Long sellerUserId,Instant lastMessageAt){}
