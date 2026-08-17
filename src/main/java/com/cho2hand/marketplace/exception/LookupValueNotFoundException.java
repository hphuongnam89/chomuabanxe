package com.cho2hand.marketplace.exception;

public class LookupValueNotFoundException extends RuntimeException {
    public LookupValueNotFoundException(String type, String code) { super(type + " not configured: " + code); }
}
