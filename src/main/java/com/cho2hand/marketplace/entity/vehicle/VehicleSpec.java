package com.cho2hand.marketplace.entity.vehicle;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicle_specs")
public class VehicleSpec {
    @Id @Column(name = "listing_id") private Long listingId;
    @Column(name = "vehicle_brand_id", nullable = false) private Long brandId;
    @Column(name = "vehicle_model_id", nullable = false) private Long modelId;
    @Column(name = "manufacture_year", nullable = false) private Integer manufactureYear;
    @Column(name = "vehicle_transmission_id", nullable = false) private Long transmissionId;
    @Column(name = "vehicle_fuel_id", nullable = false) private Long fuelId;
    @Column(name = "vehicle_origin_id", nullable = false) private Long originId;
    @Column(name = "vehicle_color_id", nullable = false) private Long colorId;
    @Column(name = "vehicle_body_type_id", nullable = false) private Long bodyTypeId;
    @Column(name = "seat_count", nullable = false) private Integer seatCount;
    @Column(name = "vehicle_driveline_id", nullable = false) private Long drivelineId;
    @Column(name = "mileage_km") private Integer mileageKm;

    public VehicleSpec() { }
    public VehicleSpec(Long listingId, Long brandId, Long modelId, Integer manufactureYear, Long transmissionId,
            Long fuelId, Long originId, Long colorId, Long bodyTypeId, Integer seatCount, Long drivelineId, Integer mileageKm) {
        this.listingId = listingId; this.brandId = brandId; this.modelId = modelId; this.manufactureYear = manufactureYear;
        this.transmissionId = transmissionId; this.fuelId = fuelId; this.originId = originId; this.colorId = colorId;
        this.bodyTypeId = bodyTypeId; this.seatCount = seatCount; this.drivelineId = drivelineId; this.mileageKm = mileageKm;
    }
    public Long getListingId() { return listingId; }
    public Long getBrandId() { return brandId; }
    public void setBrandId(Long value) { brandId = value; }
    public Long getModelId() { return modelId; }
    public void setModelId(Long value) { modelId = value; }
    public Integer getManufactureYear() { return manufactureYear; }
    public void setManufactureYear(Integer value) { manufactureYear = value; }
    public Long getTransmissionId() { return transmissionId; }
    public void setTransmissionId(Long value) { transmissionId = value; }
    public Long getFuelId() { return fuelId; }
    public void setFuelId(Long value) { fuelId = value; }
    public Long getOriginId() { return originId; }
    public void setOriginId(Long value) { originId = value; }
    public Long getColorId() { return colorId; }
    public void setColorId(Long value) { colorId = value; }
    public Long getBodyTypeId() { return bodyTypeId; }
    public void setBodyTypeId(Long value) { bodyTypeId = value; }
    public Integer getSeatCount() { return seatCount; }
    public void setSeatCount(Integer value) { seatCount = value; }
    public Long getDrivelineId() { return drivelineId; }
    public void setDrivelineId(Long value) { drivelineId = value; }
    public Integer getMileageKm() { return mileageKm; }
    public void setMileageKm(Integer value) { mileageKm = value; }
}
