package com.cho2hand.marketplace.dto.user;

import com.cho2hand.marketplace.validation.ValidDisplayName;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateUserRequest(@NotNull @ValidDisplayName String displayName,
                                @NotNull @Positive Long userStatusId,
                                @Positive Long avatarMediaId) { }
