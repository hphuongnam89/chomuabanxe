package com.cho2hand.marketplace.exception;

public class DuplicateReviewException extends RuntimeException {
    public DuplicateReviewException() {
        super("Transaction already reviewed");
    }
}
