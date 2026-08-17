package com.cho2hand.marketplace.mapper.auth;

import com.cho2hand.marketplace.dto.auth.AuthResponse;
import com.cho2hand.marketplace.entity.user.User;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {
    public AuthResponse toResponse(User user, String token, List<String> roles) {
        return new AuthResponse(token, "Bearer", user.getId(), roles);
    }
}
