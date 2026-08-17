package com.cho2hand.marketplace.repository.vehicle;

import com.cho2hand.marketplace.entity.vehicle.VehicleDriveline;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleDrivelineRepository extends JpaRepository<VehicleDriveline, Long> {
    List<VehicleDriveline> findByActiveTrueOrderBySortOrderAscDisplayNameAsc();
    Optional<VehicleDriveline> findByIdAndActiveTrue(Long id);
}
