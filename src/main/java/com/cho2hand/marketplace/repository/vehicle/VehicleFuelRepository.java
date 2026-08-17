package com.cho2hand.marketplace.repository.vehicle;

import com.cho2hand.marketplace.entity.vehicle.VehicleFuel;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleFuelRepository extends JpaRepository<VehicleFuel, Long> {
    List<VehicleFuel> findByActiveTrueOrderBySortOrderAscDisplayNameAsc();
    Optional<VehicleFuel> findByIdAndActiveTrue(Long id);
}
