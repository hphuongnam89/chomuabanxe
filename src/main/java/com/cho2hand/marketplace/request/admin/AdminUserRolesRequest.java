package com.cho2hand.marketplace.request.admin;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record AdminUserRolesRequest(
        @NotNull @Size(max = 3) List<@Pattern(regexp = "[A-Z_]+") String> roleCodes) { }
