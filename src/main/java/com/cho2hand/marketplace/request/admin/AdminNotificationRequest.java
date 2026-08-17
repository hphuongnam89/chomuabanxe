package com.cho2hand.marketplace.request.admin;
import jakarta.validation.constraints.*;
public record AdminNotificationRequest(@NotNull @Positive Long recipientUserId,@NotBlank @Size(max=500) String body,
        @Size(max=255) @Pattern(regexp="^/.*",message="Đường dẫn phải bắt đầu bằng /") String referencePath){}
