package com.cho2hand.marketplace.repository.listing;
import com.cho2hand.marketplace.entity.listing.ListingStatus;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ListingStatusRepository extends JpaRepository<ListingStatus, Long> { Optional<ListingStatus> findByCodeAndActiveTrue(String code); }
