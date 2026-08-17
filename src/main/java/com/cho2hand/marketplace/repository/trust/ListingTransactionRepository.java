package com.cho2hand.marketplace.repository.trust;
import com.cho2hand.marketplace.entity.trust.ListingTransaction;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ListingTransactionRepository extends JpaRepository<ListingTransaction,Long>{
    Optional<ListingTransaction> findByListingIdAndBuyerUserId(Long l,Long b);
    List<ListingTransaction> findByBuyerUserIdOrderByConfirmedAtDesc(Long buyerUserId);
    Page<ListingTransaction> findByStatusOrderByCreatedAtDesc(String status,Pageable pageable);
    Page<ListingTransaction> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(String status);
}
