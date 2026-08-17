package com.cho2hand.marketplace.dto.trust;import jakarta.validation.constraints.*;public record CreateReviewRequest(@Min(1)@Max(5) short rating,@Size(max=2000) String body){}
