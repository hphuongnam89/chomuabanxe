package com.cho2hand.marketplace.exception;
public class ListingAccessDeniedException extends RuntimeException { public ListingAccessDeniedException() { super("You do not own this listing"); } }
