package com.cho2hand.marketplace.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long id) { super("User not found: " + id); }
}
