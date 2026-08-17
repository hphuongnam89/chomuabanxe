package com.cho2hand.marketplace.dto.listing;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import com.cho2hand.marketplace.dto.vehicle.VehicleSpecRequest;
import java.math.BigDecimal;
public record UpdateListingRequest(@Positive Long categoryId, @Positive Long conditionId, @Positive Long locationId,
    @Size(min=1,max=180) @Pattern(regexp="(?s).*\\S.*") String title,
    @Size(min=1,max=5000) @Pattern(regexp="(?s).*\\S.*") String description,
    @DecimalMin("0") @Digits(integer=15,fraction=0) BigDecimal priceAmount,
    @Size(min=1,max=255) @Pattern(regexp="(?s).*\\S.*") String addressDetail,
    @Valid VehicleSpecRequest vehicle) { }
