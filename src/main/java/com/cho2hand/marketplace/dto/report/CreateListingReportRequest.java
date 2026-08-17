package com.cho2hand.marketplace.dto.report;import jakarta.validation.constraints.*;public record CreateListingReportRequest(@Positive Long reasonId,@Size(max=1000)String details){}
