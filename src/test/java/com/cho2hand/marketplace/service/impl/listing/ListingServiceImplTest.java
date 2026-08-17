package com.cho2hand.marketplace.service.impl.listing;
import com.cho2hand.marketplace.entity.listing.Listing;
import com.cho2hand.marketplace.exception.ListingAccessDeniedException;
import com.cho2hand.marketplace.mapper.listing.ListingMapper;
import com.cho2hand.marketplace.repository.category.CategoryRepository;
import com.cho2hand.marketplace.repository.listing.*;
import com.cho2hand.marketplace.repository.location.LocationRepository;
import com.cho2hand.marketplace.repository.media.ListingImageRepository;
import com.cho2hand.marketplace.repository.vehicle.VehicleSpecRepository;
import com.cho2hand.marketplace.entity.media.ListingImage;
import com.cho2hand.marketplace.service.security.CaptchaService;
import com.cho2hand.marketplace.service.vehicle.VehicleCatalogService;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class ListingServiceImplTest {
 @Test void adminCanUpdateAnotherSellersListing(){var listings=mock(ListingRepository.class);var images=mock(ListingImageRepository.class);var specs=mock(VehicleSpecRepository.class);var listing=new Listing();ReflectionTestUtils.setField(listing,"id",1L);listing.setSellerUserId(7L);listing.setTitle("Cũ");when(listings.findById(1L)).thenReturn(Optional.of(listing));when(images.findCoverImagesByListingIds(java.util.List.of(1L))).thenReturn(java.util.List.of());when(specs.findAllById(java.util.List.of(1L))).thenReturn(java.util.List.of());var service=new ListingServiceImpl(listings,mock(CategoryRepository.class),mock(ItemConditionRepository.class),mock(LocationRepository.class),mock(ListingStatusRepository.class),images,new ListingMapper(),mock(CaptchaService.class),specs,mock(VehicleCatalogService.class));var result=service.updateAsAdmin(1L,new com.cho2hand.marketplace.dto.listing.UpdateListingRequest(null,null,null,"Đã sửa",null,new java.math.BigDecimal("500000000"),null,null));assertEquals("Đã sửa",result.title());assertEquals(new java.math.BigDecimal("500000000"),result.priceAmount());}
 @Test void preventsAnotherUserFromArchivingListing(){var listings=mock(ListingRepository.class);var listing=new Listing();listing.setSellerUserId(7L);when(listings.findById(1L)).thenReturn(Optional.of(listing));var service=new ListingServiceImpl(listings,mock(CategoryRepository.class),mock(ItemConditionRepository.class),mock(LocationRepository.class),mock(ListingStatusRepository.class),mock(ListingImageRepository.class),new ListingMapper(),mock(CaptchaService.class),mock(VehicleSpecRepository.class),mock(VehicleCatalogService.class));assertThrows(ListingAccessDeniedException.class,()->service.archive(8L,1L));}
 @Test void includesTheFirstImageAsCover(){var listings=mock(ListingRepository.class);var images=mock(ListingImageRepository.class);var listing=new Listing();ReflectionTestUtils.setField(listing,"id",1L);when(listings.findById(1L)).thenReturn(Optional.of(listing));when(images.findCoverImagesByListingIds(java.util.List.of(1L))).thenReturn(java.util.List.of(new ListingImage(1L,2L,(short)0)));var service=new ListingServiceImpl(listings,mock(CategoryRepository.class),mock(ItemConditionRepository.class),mock(LocationRepository.class),mock(ListingStatusRepository.class),images,new ListingMapper(),mock(CaptchaService.class),mock(VehicleSpecRepository.class),mock(VehicleCatalogService.class));assertEquals("/api/v1/listings/1/images/2/content",service.get(1L).coverImageUrl());}
}
