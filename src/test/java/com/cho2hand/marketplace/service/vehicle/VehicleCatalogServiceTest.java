package com.cho2hand.marketplace.service.vehicle;

import com.cho2hand.marketplace.dto.vehicle.VehicleSpecRequest;
import com.cho2hand.marketplace.exception.LookupValueNotFoundException;
import com.cho2hand.marketplace.repository.vehicle.*;
import java.util.Optional;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class VehicleCatalogServiceTest {
    @Test
    void rejectsModelThatDoesNotBelongToSelectedBrand() {
        var brands = mock(VehicleBrandRepository.class);
        when(brands.findByIdAndActiveTrue(1L)).thenReturn(Optional.of(new com.cho2hand.marketplace.entity.vehicle.VehicleBrand()));
        var models = mock(VehicleModelRepository.class);
        when(models.findByIdAndBrandIdAndActiveTrue(2L, 1L)).thenReturn(Optional.empty());
        var service = new VehicleCatalogService(brands, models, mock(VehicleOriginRepository.class),
                mock(VehicleTransmissionRepository.class), mock(VehicleFuelRepository.class), mock(VehicleColorRepository.class),
                mock(VehicleBodyTypeRepository.class), mock(VehicleDrivelineRepository.class));

        var request = new VehicleSpecRequest(1L, 2L, 2022, 1L, 1L, 1L, 1L, 1L, 5, 1L, 1000);
        assertThrows(LookupValueNotFoundException.class, () -> service.validate(request));
        verify(models).findByIdAndBrandIdAndActiveTrue(2L, 1L);
    }
}
