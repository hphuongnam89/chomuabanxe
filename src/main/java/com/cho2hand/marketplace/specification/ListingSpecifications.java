package com.cho2hand.marketplace.specification;

import com.cho2hand.marketplace.entity.listing.Listing;
import com.cho2hand.marketplace.entity.vehicle.VehicleSpec;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import org.springframework.data.jpa.domain.Specification;

public final class ListingSpecifications {
    private ListingSpecifications() { }

    public static Specification<Listing> active(Long status) {
        return (root, query, builder) -> builder.and(builder.equal(root.get("listingStatusId"), status), builder.isNull(root.get("archivedAt")));
    }

    public static Specification<Listing> category(Long id) {
        return id == null ? null : (root, query, builder) -> builder.equal(root.get("categoryId"), id);
    }

    public static Specification<Listing> condition(Long id) {
        return id == null ? null : (root, query, builder) -> builder.equal(root.get("conditionId"), id);
    }

    public static Specification<Listing> locationIn(Collection<Long> ids) {
        return ids == null || ids.isEmpty() ? null : (root, query, builder) -> root.get("locationId").in(ids);
    }

    public static Specification<Listing> seller(Long id) {
        return id == null ? null : (root, query, builder) -> builder.equal(root.get("sellerUserId"), id);
    }

    public static Specification<Listing> price(BigDecimal min, BigDecimal max) {
        return (root, query, builder) -> {
            var predicate = builder.conjunction();
            if (min != null) predicate = builder.and(predicate, builder.greaterThanOrEqualTo(root.get("priceAmount"), min));
            if (max != null) predicate = builder.and(predicate, builder.lessThanOrEqualTo(root.get("priceAmount"), max));
            return predicate;
        };
    }

    public static Specification<Listing> keyword(String text) {
        return text == null || text.isBlank() ? null : (root, query, builder) -> {
            var term = "%" + text.trim().toLowerCase() + "%";
            return builder.or(builder.like(builder.lower(root.get("title")), term), builder.like(builder.lower(root.get("description")), term));
        };
    }

    public static Specification<Listing> vehicle(Long brandId, Long modelId, Integer minYear, Integer maxYear,
            Long transmissionId, Long fuelId, Long originId, Long colorId, Long bodyTypeId, Integer seatCount,
            Long drivelineId, Integer minMileageKm, Integer maxMileageKm) {
        if (brandId == null && modelId == null && minYear == null && maxYear == null && transmissionId == null
                && fuelId == null && originId == null && colorId == null && bodyTypeId == null && seatCount == null
                && drivelineId == null && minMileageKm == null && maxMileageKm == null) return null;
        return (root, query, builder) -> {
            var subquery = query.subquery(Long.class);
            var vehicle = subquery.from(VehicleSpec.class);
            var predicates = new ArrayList<Predicate>();
            predicates.add(builder.equal(vehicle.get("listingId"), root.get("id")));
            if (brandId != null) predicates.add(builder.equal(vehicle.get("brandId"), brandId));
            if (modelId != null) predicates.add(builder.equal(vehicle.get("modelId"), modelId));
            if (minYear != null) predicates.add(builder.greaterThanOrEqualTo(vehicle.get("manufactureYear"), minYear));
            if (maxYear != null) predicates.add(builder.lessThanOrEqualTo(vehicle.get("manufactureYear"), maxYear));
            if (transmissionId != null) predicates.add(builder.equal(vehicle.get("transmissionId"), transmissionId));
            if (fuelId != null) predicates.add(builder.equal(vehicle.get("fuelId"), fuelId));
            if (originId != null) predicates.add(builder.equal(vehicle.get("originId"), originId));
            if (colorId != null) predicates.add(builder.equal(vehicle.get("colorId"), colorId));
            if (bodyTypeId != null) predicates.add(builder.equal(vehicle.get("bodyTypeId"), bodyTypeId));
            if (seatCount != null) predicates.add(builder.equal(vehicle.get("seatCount"), seatCount));
            if (drivelineId != null) predicates.add(builder.equal(vehicle.get("drivelineId"), drivelineId));
            if (minMileageKm != null) predicates.add(builder.greaterThanOrEqualTo(vehicle.get("mileageKm"), minMileageKm));
            if (maxMileageKm != null) predicates.add(builder.lessThanOrEqualTo(vehicle.get("mileageKm"), maxMileageKm));
            subquery.select(vehicle.get("listingId")).where(predicates.toArray(Predicate[]::new));
            return builder.exists(subquery);
        };
    }

    public static Specification<Listing> notId(Long id) {
        return id == null ? null : (root, query, builder) -> builder.notEqual(root.get("id"), id);
    }
}
