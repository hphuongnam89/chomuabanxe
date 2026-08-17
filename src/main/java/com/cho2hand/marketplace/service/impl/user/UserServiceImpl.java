package com.cho2hand.marketplace.service.impl.user;

import com.cho2hand.marketplace.dto.user.CreateUserRequest;
import com.cho2hand.marketplace.dto.user.UpdateUserRequest;
import com.cho2hand.marketplace.dto.user.UserResponse;
import com.cho2hand.marketplace.exception.UserNotFoundException;
import com.cho2hand.marketplace.mapper.user.UserMapper;
import com.cho2hand.marketplace.repository.auth.UserRoleRepository;
import com.cho2hand.marketplace.repository.user.UserRepository;
import com.cho2hand.marketplace.service.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserRoleRepository userRoleRepository;

    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper, UserRoleRepository userRoleRepository) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public UserResponse create(CreateUserRequest request) {
        return userMapper.toResponse(userRepository.save(userMapper.toEntity(request)));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        var user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
        return userMapper.toResponse(user, userRoleRepository.findRoleCodesByUserId(id));
    }

    @Override
    public UserResponse update(Long id, UpdateUserRequest request) {
        var user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
        userMapper.update(user, request);
        return userMapper.toResponse(user, userRoleRepository.findRoleCodesByUserId(id));
    }
}
