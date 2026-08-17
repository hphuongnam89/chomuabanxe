package com.cho2hand.marketplace.dto.comment;import jakarta.validation.constraints.*;public record CreateCommentRequest(@NotBlank@Size(max=2000)String body){}
