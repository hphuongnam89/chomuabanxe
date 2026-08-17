package com.cho2hand.marketplace.repository.report;

import com.cho2hand.marketplace.entity.report.ListingReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingReportRepository extends JpaRepository<ListingReport, Long> {
    boolean existsByListingIdAndReporterUserIdAndReasonId(Long listing, Long reporter, Long reason);
    long countByStatus(String status);
    Page<ListingReport> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
