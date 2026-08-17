package com.cho2hand.marketplace.exception;

public class InvalidResetTokenException extends RuntimeException {
    public InvalidResetTokenException() { super("Invalid or expired reset token"); }
}
