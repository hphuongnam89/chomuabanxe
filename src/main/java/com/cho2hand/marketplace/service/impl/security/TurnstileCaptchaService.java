package com.cho2hand.marketplace.service.impl.security;

import com.cho2hand.marketplace.exception.CaptchaVerificationException;
import com.cho2hand.marketplace.service.security.CaptchaService;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TurnstileCaptchaService implements CaptchaService {
    private static final URI VERIFY_URL = URI.create("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    private final HttpClient client = HttpClient.newHttpClient();
    private final String secretKey;

    public TurnstileCaptchaService(@Value("${app.captcha.turnstile-secret-key:}") String secretKey) {
        this.secretKey = secretKey;
    }

    @Override
    public void verify(String token) {
        if (secretKey == null || secretKey.isBlank()) return;
        if (token == null || token.isBlank()) throw new CaptchaVerificationException();
        try {
            var body = "secret=" + encode(secretKey) + "&response=" + encode(token);
            var request = HttpRequest.newBuilder(VERIFY_URL)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            var response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200 || !response.body().contains("\"success\":true")) throw new CaptchaVerificationException();
        } catch (CaptchaVerificationException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new CaptchaVerificationException();
        }
    }

    private String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
}
