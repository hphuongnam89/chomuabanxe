package com.cho2hand.marketplace.mapper.listing;
import com.cho2hand.marketplace.dto.listing.ListingResponse;
import com.cho2hand.marketplace.dto.vehicle.VehicleSpecResponse;
import com.cho2hand.marketplace.entity.listing.Listing;
import org.springframework.stereotype.Component;
@Component public class ListingMapper {
    public ListingResponse toResponse(Listing v) { return toResponse(v, null, null); }
    public ListingResponse toResponse(Listing v, String coverImageUrl) { return toResponse(v, coverImageUrl, null); }
    public ListingResponse toResponse(Listing v, String coverImageUrl, VehicleSpecResponse vehicle) {
        return new ListingResponse(v.getId(), v.getSellerUserId(), v.getCategoryId(), v.getConditionId(), v.getLocationId(),
                v.getAddressDetail(), v.getTitle(), v.getDescription(), v.getPriceAmount(), v.getCurrencyCode(),
                v.getPublishedAt(), coverImageUrl, vehicle);
    }
}
