package com.cho2hand.marketplace.repository.vehicle;

import com.cho2hand.marketplace.entity.vehicle.VehicleBodyType;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleBodyTypeRepository extends JpaRepository<VehicleBodyType, Long> {
    List<VehicleBodyType> findByActiveTrueOrderBySortOrderAscDisplayNameAsc();
    Optional<VehicleBodyType> findByIdAndActiveTrue(Long id);
}
