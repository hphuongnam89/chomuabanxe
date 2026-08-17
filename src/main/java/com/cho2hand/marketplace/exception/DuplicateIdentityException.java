package com.cho2hand.marketplace.exception;

public class DuplicateIdentityException extends RuntimeException {
    public DuplicateIdentityException() { super("Email is already in use"); }
}
