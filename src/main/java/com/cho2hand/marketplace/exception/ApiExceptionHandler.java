package com.cho2hand.marketplace.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler({UserNotFoundException.class, CategoryNotFoundException.class, ListingNotFoundException.class, ConversationNotFoundException.class, TransactionNotFoundException.class})
    ProblemDetail notFound(RuntimeException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(DuplicateIdentityException.class)
    ProblemDetail conflict(DuplicateIdentityException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage());
    }
    @ExceptionHandler(DuplicateReportException.class)
    ProblemDetail duplicateReport(DuplicateReportException exception) { return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage()); }

    @ExceptionHandler({AuthenticationFailedException.class, InvalidResetTokenException.class})
    ProblemDetail unauthorized(RuntimeException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, exception.getMessage());
    }

    @ExceptionHandler(ListingAccessDeniedException.class)
    ProblemDetail forbidden(ListingAccessDeniedException exception) { return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, exception.getMessage()); }
    @ExceptionHandler(UserAccessDeniedException.class)
    ProblemDetail userForbidden(UserAccessDeniedException exception) { return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, exception.getMessage()); }
    @ExceptionHandler(AdminOperationException.class)
    ProblemDetail adminOperation(AdminOperationException exception) { return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, exception.getMessage()); }

    @ExceptionHandler(LookupValueNotFoundException.class)
    ProblemDetail invalidReference(LookupValueNotFoundException exception) { return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage()); }
    @ExceptionHandler(InvalidMediaException.class)
    ProblemDetail invalidMedia(InvalidMediaException exception) { return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage()); }
    @ExceptionHandler(MediaStorageException.class)
    ProblemDetail mediaStorage(MediaStorageException exception) { return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage()); }
    @ExceptionHandler(DuplicateReviewException.class)
    ProblemDetail duplicateReview(DuplicateReviewException exception) { return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage()); }
    @ExceptionHandler(QuotaExceededException.class)
    ProblemDetail quota(QuotaExceededException exception) { return ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS, exception.getMessage()); }
    @ExceptionHandler(CaptchaVerificationException.class)
    ProblemDetail captcha(CaptchaVerificationException exception) { return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, exception.getMessage()); }

    @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class})
    ProblemDetail validation(Exception exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");
    }
}
