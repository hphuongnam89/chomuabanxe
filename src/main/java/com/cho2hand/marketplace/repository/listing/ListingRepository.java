package com.cho2hand.marketplace.repository.listing;
import com.cho2hand.marketplace.entity.listing.Listing;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface ListingRepository extends JpaRepository<Listing, Long>, JpaSpecificationExecutor<Listing> {
    long countByArchivedAtIsNull();
    long countByArchivedAtIsNotNull();
    long countByListingStatusIdAndArchivedAtIsNull(Long listingStatusId);
    long countByPublishedAtGreaterThanEqualAndArchivedAtIsNull(Instant publishedAt);
    long countBySellerUserId(Long sellerUserId);
    @Query("""
            select l from Listing l
            where (:query is null or lower(l.title) like lower(concat('%', :query, '%')) or str(l.id) = :query)
              and (:archived is null or (:archived = true and l.archivedAt is not null)
                   or (:archived = false and l.archivedAt is null))
            order by l.createdAt desc
            """)
    Page<Listing> searchForAdmin(@Param("query") String query, @Param("archived") Boolean archived, Pageable pageable);
    Page<Listing> findByListingStatusIdAndArchivedAtIsNullOrderByPublishedAtDescIdDesc(Long statusId, Pageable pageable);
    Page<Listing> findByListingStatusIdAndCategoryIdAndArchivedAtIsNullOrderByPublishedAtDescIdDesc(Long statusId, Long categoryId, Pageable pageable);
    Page<Listing> findBySellerUserIdAndArchivedAtIsNullOrderByPublishedAtDescIdDesc(Long sellerUserId, Pageable pageable);
    @Query("""
            select count(distinct l.id) from Listing l
            where l.sellerUserId = :sellerUserId
              and l.archivedAt is null
              and l.publishedAt >= :publishedAt
              and exists (
                  select 1 from ListingImage image
                  where image.id.listingId = l.id
              )
            """)
    long countPublishedWithImagesThisMonth(@Param("sellerUserId") Long sellerUserId, @Param("publishedAt") Instant publishedAt);
}
