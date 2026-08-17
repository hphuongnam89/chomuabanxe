package com.cho2hand.marketplace.dto.user;

import com.cho2hand.marketplace.validation.ValidDisplayName;
import jakarta.validation.constraints.Positive;

public record UpdateUserRequest(@ValidDisplayName String displayName,
                                @Positive Long avatarMediaId) { }
