package com.cho2hand.marketplace.request.admin;
import jakarta.validation.constraints.*;
public record AdminCategoryRequest(Long parentId,@NotBlank @Size(max=120) String name,
        @NotBlank @Pattern(regexp="[a-z0-9-]+") @Size(max=140) String slug,boolean leaf,
        @Min(0) @Max(32767) short sortOrder,boolean active){}
