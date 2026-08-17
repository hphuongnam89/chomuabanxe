package com.cho2hand.marketplace.service.admin;

import com.cho2hand.marketplace.dto.admin.AdminListingResponse;
import com.cho2hand.marketplace.dto.admin.AdminCategoryResponse;
import com.cho2hand.marketplace.dto.admin.AdminLocationResponse;
import com.cho2hand.marketplace.dto.admin.AdminOperationsStatsResponse;
import com.cho2hand.marketplace.dto.admin.AdminReviewResponse;
import com.cho2hand.marketplace.dto.admin.AdminTransactionResponse;
import com.cho2hand.marketplace.dto.admin.AdminUserResponse;
import com.cho2hand.marketplace.dto.admin.AdminRoleResponse;
import com.cho2hand.marketplace.dto.admin.AdminPermissionResponse;
import com.cho2hand.marketplace.dto.admin.AdminAuditResponse;
import com.cho2hand.marketplace.dto.admin.AdminHealthResponse;
import com.cho2hand.marketplace.dto.report.AdminReportResponse;
import com.cho2hand.marketplace.dto.report.AdminStatsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import com.cho2hand.marketplace.request.admin.AdminCategoryRequest;
import com.cho2hand.marketplace.request.admin.AdminNotificationRequest;
import com.cho2hand.marketplace.request.admin.AdminUserRolesRequest;

public interface AdminService {
    AdminStatsResponse stats();
    Page<AdminUserResponse> users(String query, Long statusId, Pageable pageable);
    void setUserSuspended(Long adminUserId, Long userId, boolean suspended);
    Page<AdminListingResponse> listings(String query, Boolean archived, Pageable pageable);
    List<AdminReportResponse> reports();
    void archive(Long adminUserId, Long listingId);
    void restore(Long adminUserId, Long listingId);
    void resolve(Long adminUserId, Long reportId, boolean archive);
    List<AdminCategoryResponse> categories();
    AdminCategoryResponse createCategory(Long adminUserId, AdminCategoryRequest request);
    AdminCategoryResponse updateCategory(Long adminUserId, Long id, AdminCategoryRequest request);
    Page<AdminLocationResponse> locations(String query, Byte level, Pageable pageable);
    void setLocationActive(Long adminUserId, Long id, boolean active);
    AdminOperationsStatsResponse operationsStats();
    Page<AdminTransactionResponse> transactions(String status, Pageable pageable);
    Page<AdminReviewResponse> reviews(String status, Pageable pageable);
    void setReviewVisible(Long adminUserId, Long id, boolean visible);
    void sendNotification(Long adminUserId, AdminNotificationRequest request);
    Page<AdminAuditResponse> auditLogs(Pageable pageable);
    AdminHealthResponse health();
    void setAdminRole(Long adminUserId, Long userId, boolean enabled);
    List<AdminRoleResponse> roles();
    List<AdminPermissionResponse> permissions();
    void setUserRoles(Long adminUserId, Long userId, AdminUserRolesRequest request);
}
