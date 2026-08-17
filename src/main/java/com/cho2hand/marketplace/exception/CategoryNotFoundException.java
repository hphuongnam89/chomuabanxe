package com.cho2hand.marketplace.exception;

public class CategoryNotFoundException extends RuntimeException {
    public CategoryNotFoundException(String slug) { super("Category not found: " + slug); }
}
