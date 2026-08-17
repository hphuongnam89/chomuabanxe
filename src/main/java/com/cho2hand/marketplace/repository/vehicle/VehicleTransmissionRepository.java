package com.cho2hand.marketplace.repository.vehicle;

import com.cho2hand.marketplace.entity.vehicle.VehicleTransmission;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleTransmissionRepository extends JpaRepository<VehicleTransmission, Long> {
    List<VehicleTransmission> findByActiveTrueOrderBySortOrderAscDisplayNameAsc();
    Optional<VehicleTransmission> findByIdAndActiveTrue(Long id);
}
