package com.cho2hand.marketplace.dto.location;

import java.util.List;

public record LocationResponse(Long id, String name, String code, int level, List<LocationResponse> children) { }
