package com.cho2hand.marketplace.exception;

public class CaptchaVerificationException extends RuntimeException {
    public CaptchaVerificationException() { super("Vui lòng xác minh CAPTCHA để tiếp tục."); }
}
