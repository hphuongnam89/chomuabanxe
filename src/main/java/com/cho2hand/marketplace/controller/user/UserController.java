package com.cho2hand.marketplace.controller.user;

import com.cho2hand.marketplace.exception.AuthenticationFailedException;
import com.cho2hand.marketplace.exception.UserAccessDeniedException;
import com.cho2hand.marketplace.dto.user.UpdateUserRequest;
import com.cho2hand.marketplace.dto.user.UserResponse;
import com.cho2hand.marketplace.service.user.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) { this.userService = userService; }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal Long currentUserId) {
        if (currentUserId == null) throw new AuthenticationFailedException();
        return userService.getById(currentUserId);
    }

    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable @Positive Long id) { return userService.getById(id); }

    @PatchMapping("/{id}")
    public UserResponse update(@AuthenticationPrincipal Long currentUserId, @PathVariable @Positive Long id, @Valid @RequestBody UpdateUserRequest request) {
        if (!id.equals(currentUserId)) throw new UserAccessDeniedException();
        return userService.update(id, request);
    }
}
