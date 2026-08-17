package com.cho2hand.marketplace.repository.vehicle;

import com.cho2hand.marketplace.entity.vehicle.VehicleModel;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleModelRepository extends JpaRepository<VehicleModel, Long> {
    List<VehicleModel> findByBrandIdAndActiveTrueOrderBySortOrderAscNameAsc(Long brandId);
    Optional<VehicleModel> findByIdAndBrandIdAndActiveTrue(Long id, Long brandId);
}
