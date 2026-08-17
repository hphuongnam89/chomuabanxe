package com.cho2hand.marketplace.mapper.user;

import com.cho2hand.marketplace.dto.user.CreateUserRequest;
import com.cho2hand.marketplace.dto.user.UserResponse;
import com.cho2hand.marketplace.dto.user.UpdateUserRequest;
import com.cho2hand.marketplace.entity.user.User;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public User toEntity(CreateUserRequest request) {
        var user = new User();
        user.setDisplayName(request.displayName());
        user.setUserStatusId(request.userStatusId());
        user.setAvatarMediaId(request.avatarMediaId());
        return user;
    }

    public void update(User user, UpdateUserRequest request) {
        if (request.displayName() != null) user.setDisplayName(request.displayName());
        if (request.avatarMediaId() != null) user.setAvatarMediaId(request.avatarMediaId());
    }

    public UserResponse toResponse(User user) {
        return toResponse(user, List.of());
    }

    public UserResponse toResponse(User user, List<String> roles) {
        return new UserResponse(user.getId(), user.getUserStatusId(), user.getDisplayName(),
                user.getAvatarMediaId(), user.getJoinedAt(), user.getLastActiveAt(), roles);
    }
}
