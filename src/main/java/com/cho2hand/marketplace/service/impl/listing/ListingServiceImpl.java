package com.cho2hand.marketplace.service.impl.listing;

import com.cho2hand.marketplace.dto.listing.*;
import com.cho2hand.marketplace.dto.vehicle.*;
import com.cho2hand.marketplace.entity.listing.Listing;
import com.cho2hand.marketplace.entity.listing.ListingStatus;
import com.cho2hand.marketplace.entity.vehicle.VehicleSpec;
import com.cho2hand.marketplace.exception.*;
import com.cho2hand.marketplace.mapper.listing.ListingMapper;
import com.cho2hand.marketplace.repository.category.CategoryRepository;
import com.cho2hand.marketplace.repository.listing.*;
import com.cho2hand.marketplace.repository.location.LocationRepository;
import com.cho2hand.marketplace.repository.media.ListingImageRepository;
import com.cho2hand.marketplace.repository.vehicle.VehicleSpecRepository;
import com.cho2hand.marketplace.service.listing.ListingService;
import com.cho2hand.marketplace.service.security.CaptchaService;
import com.cho2hand.marketplace.service.vehicle.VehicleCatalogService;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.cho2hand.marketplace.specification.ListingSpecifications.*;

@Service
@Transactional
public class ListingServiceImpl implements ListingService {
    private static final Logger log = LoggerFactory.getLogger(ListingServiceImpl.class);
    private static final int MONTHLY_LISTING_LIMIT = 3;
    private final ListingRepository listings;
    private final CategoryRepository categories;
    private final ItemConditionRepository conditions;
    private final LocationRepository locations;
    private final ListingStatusRepository statuses;
    private final ListingImageRepository images;
    private final ListingMapper mapper;
    private final CaptchaService captchaService;
    private final VehicleSpecRepository vehicleSpecs;
    private final VehicleCatalogService vehicleCatalog;

    public ListingServiceImpl(ListingRepository listings, CategoryRepository categories, ItemConditionRepository conditions,
            LocationRepository locations, ListingStatusRepository statuses, ListingImageRepository images, ListingMapper mapper,
            CaptchaService captchaService, VehicleSpecRepository vehicleSpecs, VehicleCatalogService vehicleCatalog) {
        this.listings = listings; this.categories = categories; this.conditions = conditions; this.locations = locations;
        this.statuses = statuses; this.images = images; this.mapper = mapper; this.captchaService = captchaService;
        this.vehicleSpecs = vehicleSpecs; this.vehicleCatalog = vehicleCatalog;
    }

    @Override
    public ListingResponse create(Long seller, CreateListingRequest request) {
        captchaService.verify(request.captchaToken());
        enforceMonthlyQuota(seller);
        validate(request.categoryId(), request.conditionId(), request.locationId());
        vehicleCatalog.validate(request.vehicle());

        var listing = new Listing();
        listing.setSellerUserId(seller); listing.setCategoryId(request.categoryId()); listing.setConditionId(request.conditionId());
        listing.setLocationId(request.locationId()); listing.setAddressDetail(request.addressDetail().trim());
        listing.setTitle(request.title().trim()); listing.setDescription(request.description().trim()); listing.setPriceAmount(request.priceAmount());
        listing.setCurrencyCode("VND"); listing.setListingStatusId(activeStatus().getId()); listing.setPublishedAt(Instant.now());
        var saved = listings.save(listing);
        vehicleSpecs.save(toEntity(saved.getId(), request.vehicle()));
        return response(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ListingResponse get(Long id) {
        return response(listings.findById(id).filter(listing -> listing.getArchivedAt() == null)
                .orElseThrow(() -> new ListingNotFoundException(id)));
    }

    @Override
    public ListingResponse update(Long seller, Long id, UpdateListingRequest request) {
        return update(owned(seller, id), id, request);
    }

    @Override
    public ListingResponse updateAsAdmin(Long id, UpdateListingRequest request) {
        var listing = listings.findById(id).orElseThrow(() -> new ListingNotFoundException(id));
        return update(listing, id, request);
    }

    private ListingResponse update(Listing listing, Long id, UpdateListingRequest request) {
        if (request.categoryId() != null) { validateCategory(request.categoryId()); listing.setCategoryId(request.categoryId()); }
        if (request.conditionId() != null) { validateCondition(request.conditionId()); listing.setConditionId(request.conditionId()); }
        if (request.locationId() != null) { validateLocation(request.locationId()); listing.setLocationId(request.locationId()); }
        if (request.title() != null) listing.setTitle(request.title().trim());
        if (request.description() != null) listing.setDescription(request.description().trim());
        if (request.priceAmount() != null) listing.setPriceAmount(request.priceAmount());
        if (request.addressDetail() != null) listing.setAddressDetail(request.addressDetail().trim());
        if (request.vehicle() != null) {
            vehicleCatalog.validate(request.vehicle());
            vehicleSpecs.save(apply(vehicleSpecs.findById(id).orElseGet(VehicleSpec::new), id, request.vehicle()));
        }
        return response(listing);
    }

    @Override
    public void archive(Long seller, Long id) { owned(seller, id).setArchivedAt(Instant.now()); }

    @Override
    @Transactional(readOnly = true)
    public Page<ListingResponse> mine(Long seller, int page, int size) {
        return page(listings.findBySellerUserIdAndArchivedAtIsNullOrderByPublishedAtDescIdDesc(seller, PageRequest.of(page, size)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ListingResponse> search(ListingSearchRequest request) {
        var pageable = pageable(request.sort(), request.page(), request.size());
        Specification<Listing> spec = Specification.where(active(activeStatus().getId()))
                .and(keyword(request.keyword())).and(category(request.categoryId())).and(condition(request.conditionId()))
                .and(locationIn(locationScope(request.locationId()))).and(seller(request.sellerUserId()))
                .and(price(request.minPrice(), request.maxPrice()))
                .and(vehicle(request.brandId(), request.modelId(), request.minYear(), request.maxYear(), request.transmissionId(),
                        request.fuelId(), request.originId(), request.colorId(), request.bodyTypeId(), request.seatCount(),
                        request.drivelineId(), request.minMileageKm(), request.maxMileageKm()))
                .and(notId(request.excludeId()));
        return page(listings.findAll(spec, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ListingResponse> recommendations(Long brandId, Long modelId, BigDecimal minPrice, BigDecimal maxPrice,
            Long locationId, Long excludeId, int page, int size) {
        return search(new ListingSearchRequest(null, null, null, locationId, null, minPrice, maxPrice, brandId, modelId,
                null, null, null, null, null, null, null, null, null, null, null, excludeId, null, page, size));
    }

    private Page<ListingResponse> page(Page<Listing> page) {
        return new PageImpl<>(responses(page.getContent()), page.getPageable(), page.getTotalElements());
    }

    private static Pageable pageable(String sort, int page, int size) {
        var value = sort == null || sort.isBlank() ? "-publishedAt" : sort.trim();
        var descending = value.startsWith("-");
        var key = descending ? value.substring(1) : value;
        var property = switch (key) {
            case "price", "priceAmount" -> "priceAmount";
            case "createdAt" -> "createdAt";
            case "oldest", "publishedAt" -> "publishedAt";
            default -> "publishedAt";
        };
        var primary = descending ? Sort.Order.desc(property) : Sort.Order.asc(property);
        return PageRequest.of(page, size, Sort.by(primary, Sort.Order.desc("id")));
    }

    private ListingResponse response(Listing listing) { return responses(List.of(listing)).getFirst(); }

    private List<ListingResponse> responses(List<Listing> values) {
        if (values.isEmpty()) return List.of();
        var listingIds = values.stream().map(Listing::getId).toList();
        Map<Long, Long> covers = images.findCoverImagesByListingIds(listingIds).stream()
                .collect(Collectors.toMap(image -> image.getId().getListingId(), image -> image.getId().getMediaId()));
        Map<Long, VehicleSpec> specs = vehicleSpecs.findAllById(listingIds).stream()
                .collect(Collectors.toMap(VehicleSpec::getListingId, Function.identity()));
        return values.stream().map(listing -> mapper.toResponse(listing, coverUrl(listing.getId(), covers.get(listing.getId())),
                vehicleResponse(specs.get(listing.getId())))).toList();
    }

    private static VehicleSpecResponse vehicleResponse(VehicleSpec value) {
        return value == null ? null : new VehicleSpecResponse(value.getBrandId(), value.getModelId(), value.getManufactureYear(),
                value.getTransmissionId(), value.getFuelId(), value.getOriginId(), value.getColorId(), value.getBodyTypeId(),
                value.getSeatCount(), value.getDrivelineId(), value.getMileageKm());
    }

    private static String coverUrl(Long listingId, Long mediaId) {
        return mediaId == null ? null : "/api/v1/listings/" + listingId + "/images/" + mediaId + "/content";
    }

    private static VehicleSpec toEntity(Long listingId, VehicleSpecRequest request) {
        return new VehicleSpec(listingId, request.brandId(), request.modelId(), request.manufactureYear(), request.transmissionId(),
                request.fuelId(), request.originId(), request.colorId(), request.bodyTypeId(), request.seatCount(),
                request.drivelineId(), request.mileageKm());
    }

    private static VehicleSpec apply(VehicleSpec target, Long listingId, VehicleSpecRequest request) {
        target = target.getListingId() == null ? new VehicleSpec(listingId, request.brandId(), request.modelId(), request.manufactureYear(),
                request.transmissionId(), request.fuelId(), request.originId(), request.colorId(), request.bodyTypeId(), request.seatCount(),
                request.drivelineId(), request.mileageKm()) : target;
        target.setBrandId(request.brandId()); target.setModelId(request.modelId()); target.setManufactureYear(request.manufactureYear());
        target.setTransmissionId(request.transmissionId()); target.setFuelId(request.fuelId()); target.setOriginId(request.originId());
        target.setColorId(request.colorId()); target.setBodyTypeId(request.bodyTypeId()); target.setSeatCount(request.seatCount());
        target.setDrivelineId(request.drivelineId()); target.setMileageKm(request.mileageKm());
        return target;
    }

    private Listing owned(Long seller, Long id) {
        var listing = listings.findById(id).orElseThrow(() -> new ListingNotFoundException(id));
        if (!seller.equals(listing.getSellerUserId())) throw new ListingAccessDeniedException();
        return listing;
    }

    private void validate(Long categoryId, Long conditionId, Long locationId) {
        validateCategory(categoryId); validateCondition(conditionId); validateLocation(locationId);
    }

    private void validateCategory(Long id) {
        if (categories.findByIdAndActiveTrue(id).filter(value -> value.isLeaf()).isEmpty())
            throw new LookupValueNotFoundException("Leaf category", id.toString());
    }

    private void validateCondition(Long id) {
        if (conditions.findByIdAndActiveTrue(id).isEmpty()) throw new LookupValueNotFoundException("Condition", id.toString());
    }

    private void validateLocation(Long id) {
        if (locations.findByIdAndActiveTrue(id).filter(value -> value.getLevel() == 3).isEmpty())
            throw new LookupValueNotFoundException("Ward", id.toString());
    }

    private List<Long> locationScope(Long id) {
        if (id == null) return null;
        var location = locations.findByIdAndActiveTrue(id).orElseThrow(() -> new LookupValueNotFoundException("Location", id.toString()));
        if (location.getLevel() == 3) return List.of(id);
        var childIds = locations.findByParentLocationIdAndActiveTrue(id).stream().map(value -> value.getId()).toList();
        return childIds.isEmpty() ? List.of(id) : childIds;
    }

    private ListingStatus activeStatus() {
        return statuses.findByCodeAndActiveTrue("ACTIVE")
                .orElseThrow(() -> new LookupValueNotFoundException("Listing status", "ACTIVE"));
    }

    private void enforceMonthlyQuota(Long seller) {
        var start = YearMonth.now(ZoneId.of("Asia/Ho_Chi_Minh")).atDay(1)
                .atStartOfDay(ZoneId.of("Asia/Ho_Chi_Minh")).toInstant();
        var used = listings.countPublishedWithImagesThisMonth(seller, start);
        if (used >= MONTHLY_LISTING_LIMIT) {
            log.warn("monthly_listing_quota_exceeded sellerUserId={} used={} limit={}", seller, used, MONTHLY_LISTING_LIMIT);
            throw new QuotaExceededException("Bạn đã dùng hết 3 lượt đăng tin trong tháng này.");
        }
    }
}
