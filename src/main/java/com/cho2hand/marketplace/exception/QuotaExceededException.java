package com.cho2hand.marketplace.exception;

public class QuotaExceededException extends RuntimeException {
    public QuotaExceededException(String message) { super(message); }
}
