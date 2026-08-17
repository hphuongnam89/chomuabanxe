package com.cho2hand.marketplace.dto.chat; import java.time.Instant; public record MessageResponse(Long id,Long senderUserId,String body,Instant sentAt){}
