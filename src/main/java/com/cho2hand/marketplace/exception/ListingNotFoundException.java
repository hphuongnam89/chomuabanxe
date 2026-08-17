package com.cho2hand.marketplace.exception;
public class ListingNotFoundException extends RuntimeException { public ListingNotFoundException(Long id) { super("Listing not found: " + id); } }
