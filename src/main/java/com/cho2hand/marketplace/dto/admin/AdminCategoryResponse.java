package com.cho2hand.marketplace.dto.admin;
public record AdminCategoryResponse(Long id,Long parentId,String name,String slug,boolean leaf,short sortOrder,boolean active){}
