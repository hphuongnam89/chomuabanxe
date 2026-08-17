package com.cho2hand.marketplace.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class DisplayNameValidator implements ConstraintValidator<ValidDisplayName, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value == null || value.trim().length() >= 2 && value.trim().length() <= 100;
    }
}
