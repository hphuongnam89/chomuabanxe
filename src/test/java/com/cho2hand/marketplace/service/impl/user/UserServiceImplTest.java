package com.cho2hand.marketplace.service.impl.user;

import com.cho2hand.marketplace.dto.user.CreateUserRequest;
import com.cho2hand.marketplace.dto.user.UpdateUserRequest;
import com.cho2hand.marketplace.entity.user.User;
import com.cho2hand.marketplace.exception.UserNotFoundException;
import com.cho2hand.marketplace.mapper.user.UserMapper;
import com.cho2hand.marketplace.repository.auth.UserRoleRepository;
import com.cho2hand.marketplace.repository.user.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {
    @Mock UserRepository userRepository;
    @Mock UserRoleRepository userRoleRepository;
    @InjectMocks UserServiceImpl userService;
    @Spy UserMapper userMapper = new UserMapper();

    @Test
    void getsExistingUser() {
        var user = new User();
        user.setDisplayName("Minh");
        user.setUserStatusId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRoleRepository.findRoleCodesByUserId(1L)).thenReturn(List.of("USER"));

        assertThat(userService.getById(1L).displayName()).isEqualTo("Minh");
    }

    @Test
    void rejectsMissingUser() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getById(99L)).isInstanceOf(UserNotFoundException.class);
    }
}
