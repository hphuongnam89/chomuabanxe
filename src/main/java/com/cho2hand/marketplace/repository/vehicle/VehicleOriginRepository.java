package com.cho2hand.marketplace.repository.vehicle;

import com.cho2hand.marketplace.entity.vehicle.VehicleOrigin;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleOriginRepository extends JpaRepository<VehicleOrigin, Long> {
    List<VehicleOrigin> findByActiveTrueOrderBySortOrderAscDisplayNameAsc();
    Optional<VehicleOrigin> findByIdAndActiveTrue(Long id);
}
