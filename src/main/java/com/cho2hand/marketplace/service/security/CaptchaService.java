package com.cho2hand.marketplace.service.security;

public interface CaptchaService {
    void verify(String token);
}
