package com.cho2hand.marketplace.repository.vehicle;

import com.cho2hand.marketplace.entity.vehicle.VehicleBrand;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleBrandRepository extends JpaRepository<VehicleBrand, Long> {
    List<VehicleBrand> findByActiveTrueOrderBySortOrderAscNameAsc();
    Optional<VehicleBrand> findByIdAndActiveTrue(Long id);
}
