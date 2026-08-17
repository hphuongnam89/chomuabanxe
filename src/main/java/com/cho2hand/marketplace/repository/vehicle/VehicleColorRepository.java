package com.cho2hand.marketplace.repository.vehicle;

import com.cho2hand.marketplace.entity.vehicle.VehicleColor;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleColorRepository extends JpaRepository<VehicleColor, Long> {
    List<VehicleColor> findByActiveTrueOrderBySortOrderAscDisplayNameAsc();
    Optional<VehicleColor> findByIdAndActiveTrue(Long id);
}
