package com.cho2hand.marketplace.dto.comment;import java.time.Instant;public record CommentResponse(Long id,Long authorUserId,String body,Instant createdAt){}
