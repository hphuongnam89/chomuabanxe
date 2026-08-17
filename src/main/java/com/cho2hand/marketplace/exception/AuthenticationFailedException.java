package com.cho2hand.marketplace.exception;

public class AuthenticationFailedException extends RuntimeException {
    public AuthenticationFailedException() { super("Invalid credentials"); }
}
