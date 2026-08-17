package com.cho2hand.marketplace.dto.trust; import jakarta.validation.constraints.Positive;public record ConfirmTransactionRequest(@Positive Long buyerUserId){}
