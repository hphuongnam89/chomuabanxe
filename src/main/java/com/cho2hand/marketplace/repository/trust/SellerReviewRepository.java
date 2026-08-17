package com.cho2hand.marketplace.repository.trust;

import com.cho2hand.marketplace.entity.trust.SellerReview;
import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SellerReviewRepository extends JpaRepository<SellerReview,Long>{
    boolean existsByTransactionId(Long id);
    Page<SellerReview> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<SellerReview> findByStatusOrderByCreatedAtDesc(String status,Pageable pageable);
    long countByStatus(String status);
    @Query(value="select coalesce(avg(r.rating),0) from seller_reviews r where r.status='VISIBLE'",nativeQuery=true) BigDecimal averageVisible();
    @Query(value="select coalesce(avg(r.rating),0) from seller_reviews r join listing_transactions t on t.transaction_id=r.transaction_id join listings l on l.listing_id=t.listing_id where l.seller_user_id=:seller and r.status='VISIBLE'",nativeQuery=true) BigDecimal averageForSeller(@Param("seller") Long seller);
    @Query(value="select count(*) from seller_reviews r join listing_transactions t on t.transaction_id=r.transaction_id join listings l on l.listing_id=t.listing_id where l.seller_user_id=:seller and r.status='VISIBLE'",nativeQuery=true) long countForSeller(@Param("seller") Long seller);
}
