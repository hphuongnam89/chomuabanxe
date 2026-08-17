package com.cho2hand.marketplace.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = DisplayNameValidator.class)
@Target({FIELD, PARAMETER})
@Retention(RUNTIME)
public @interface ValidDisplayName {
    String message() default "displayName must contain 2 to 100 non-blank characters";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
