package com.cho2hand.marketplace.dto.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminVehicleOptionRequest(
        @NotBlank @Size(max = 64) @Pattern(regexp = "[a-z0-9][a-z0-9-]*") String code,
        @NotBlank @Size(max = 120) String name,
        @NotNull @Min(0) @Max(32767) Integer sortOrder,
        @NotNull Boolean active,
        Long parentId) { }
