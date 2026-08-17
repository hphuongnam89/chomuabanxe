package com.cho2hand.marketplace.service.user;

import com.cho2hand.marketplace.dto.user.CreateUserRequest;
import com.cho2hand.marketplace.dto.user.UpdateUserRequest;
import com.cho2hand.marketplace.dto.user.UserResponse;

public interface UserService {
    UserResponse create(CreateUserRequest request);
    UserResponse getById(Long id);
    UserResponse update(Long id, UpdateUserRequest request);
}
