package com.cho2hand.marketplace.dto.chat; import jakarta.validation.constraints.*; public record SendMessageRequest(@NotBlank @Size(max=2000) String body){}
