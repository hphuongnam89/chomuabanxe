package com.cho2hand.marketplace.service.vehicle;

import com.cho2hand.marketplace.dto.vehicle.*;
import com.cho2hand.marketplace.exception.LookupValueNotFoundException;
import com.cho2hand.marketplace.repository.vehicle.*;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class VehicleCatalogService {
    private final VehicleBrandRepository brands;
    private final VehicleModelRepository models;
    private final VehicleOriginRepository origins;
    private final VehicleTransmissionRepository transmissions;
    private final VehicleFuelRepository fuels;
    private final VehicleColorRepository colors;
    private final VehicleBodyTypeRepository bodyTypes;
    private final VehicleDrivelineRepository drivelines;

    public VehicleCatalogService(VehicleBrandRepository brands, VehicleModelRepository models, VehicleOriginRepository origins,
            VehicleTransmissionRepository transmissions, VehicleFuelRepository fuels, VehicleColorRepository colors,
            VehicleBodyTypeRepository bodyTypes, VehicleDrivelineRepository drivelines) {
        this.brands = brands; this.models = models; this.origins = origins; this.transmissions = transmissions;
        this.fuels = fuels; this.colors = colors; this.bodyTypes = bodyTypes; this.drivelines = drivelines;
    }

    public VehicleCatalogResponse catalog() {
        return new VehicleCatalogResponse(
                brands.findByActiveTrueOrderBySortOrderAscNameAsc().stream().map(value -> option(value.getId(), null, value.getCode(), value.getName(), value.getSortOrder())).toList(),
                origins.findByActiveTrueOrderBySortOrderAscDisplayNameAsc().stream().map(value -> option(value.getId(), null, value.getCode(), value.getDisplayName(), value.getSortOrder())).toList(),
                transmissions.findByActiveTrueOrderBySortOrderAscDisplayNameAsc().stream().map(value -> option(value.getId(), null, value.getCode(), value.getDisplayName(), value.getSortOrder())).toList(),
                fuels.findByActiveTrueOrderBySortOrderAscDisplayNameAsc().stream().map(value -> option(value.getId(), null, value.getCode(), value.getDisplayName(), value.getSortOrder())).toList(),
                colors.findByActiveTrueOrderBySortOrderAscDisplayNameAsc().stream().map(value -> option(value.getId(), null, value.getCode(), value.getDisplayName(), value.getSortOrder())).toList(),
                bodyTypes.findByActiveTrueOrderBySortOrderAscDisplayNameAsc().stream().map(value -> option(value.getId(), null, value.getCode(), value.getDisplayName(), value.getSortOrder())).toList(),
                drivelines.findByActiveTrueOrderBySortOrderAscDisplayNameAsc().stream().map(value -> option(value.getId(), null, value.getCode(), value.getDisplayName(), value.getSortOrder())).toList());
    }

    public List<VehicleOptionResponse> models(Long brandId) {
        require(brands.findByIdAndActiveTrue(brandId).isPresent(), "Vehicle brand", brandId);
        return models.findByBrandIdAndActiveTrueOrderBySortOrderAscNameAsc(brandId).stream()
                .map(value -> option(value.getId(), value.getBrandId(), value.getCode(), value.getName(), value.getSortOrder())).toList();
    }

    public void validate(VehicleSpecRequest request) {
        require(brands.findByIdAndActiveTrue(request.brandId()).isPresent(), "Vehicle brand", request.brandId());
        require(models.findByIdAndBrandIdAndActiveTrue(request.modelId(), request.brandId()).isPresent(), "Vehicle model", request.modelId());
        require(origins.findByIdAndActiveTrue(request.originId()).isPresent(), "Vehicle origin", request.originId());
        require(transmissions.findByIdAndActiveTrue(request.transmissionId()).isPresent(), "Vehicle transmission", request.transmissionId());
        require(fuels.findByIdAndActiveTrue(request.fuelId()).isPresent(), "Vehicle fuel", request.fuelId());
        require(colors.findByIdAndActiveTrue(request.colorId()).isPresent(), "Vehicle color", request.colorId());
        require(bodyTypes.findByIdAndActiveTrue(request.bodyTypeId()).isPresent(), "Vehicle body type", request.bodyTypeId());
        require(drivelines.findByIdAndActiveTrue(request.drivelineId()).isPresent(), "Vehicle driveline", request.drivelineId());
    }

    private static VehicleOptionResponse option(Long id, Long parentId, String code, String name, short sortOrder) {
        return new VehicleOptionResponse(id, parentId, code, name, sortOrder);
    }

    private static void require(boolean present, String type, Long id) {
        if (!present) throw new LookupValueNotFoundException(type, id.toString());
    }
}
