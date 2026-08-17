package com.cho2hand.marketplace.dto.category;

import java.util.List;

public record CategoryResponse(Long id, String name, String slug, boolean leaf, List<CategoryResponse> children) { }
