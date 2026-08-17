package com.cho2hand.marketplace.repository.media;
import com.cho2hand.marketplace.entity.media.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface ListingImageRepository extends JpaRepository<ListingImage,ListingImageId>{
 long countByIdListingId(Long id);
 List<ListingImage> findByIdListingIdOrderBySortOrderAsc(Long id);
 @Query("select image from ListingImage image where image.id.listingId in :listingIds and image.sortOrder=(select min(candidate.sortOrder) from ListingImage candidate where candidate.id.listingId=image.id.listingId)")
 List<ListingImage> findCoverImagesByListingIds(@Param("listingIds") Collection<Long> listingIds);
}
