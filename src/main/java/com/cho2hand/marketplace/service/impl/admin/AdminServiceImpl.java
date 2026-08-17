package com.cho2hand.marketplace.service.impl.admin;

import com.cho2hand.marketplace.dto.admin.*;
import com.cho2hand.marketplace.dto.report.AdminReportResponse;
import com.cho2hand.marketplace.dto.report.AdminStatsResponse;
import com.cho2hand.marketplace.dto.listing.ListingResponse;
import com.cho2hand.marketplace.dto.listing.UpdateListingRequest;
import com.cho2hand.marketplace.entity.listing.Listing;
import com.cho2hand.marketplace.entity.category.Category;
import com.cho2hand.marketplace.entity.admin.AdminAuditLog;
import com.cho2hand.marketplace.entity.auth.UserRole;
import com.cho2hand.marketplace.entity.auth.UserRoleId;
import com.cho2hand.marketplace.exception.AdminOperationException;
import com.cho2hand.marketplace.exception.ListingNotFoundException;
import com.cho2hand.marketplace.exception.LookupValueNotFoundException;
import com.cho2hand.marketplace.exception.UserNotFoundException;
import com.cho2hand.marketplace.repository.auth.UserRoleRepository;
import com.cho2hand.marketplace.repository.auth.RoleRepository;
import com.cho2hand.marketplace.repository.auth.UserAuthIdentityRepository;
import com.cho2hand.marketplace.repository.admin.AdminAuditLogRepository;
import com.cho2hand.marketplace.repository.category.CategoryRepository;
import com.cho2hand.marketplace.repository.listing.ListingRepository;
import com.cho2hand.marketplace.repository.location.LocationRepository;
import com.cho2hand.marketplace.repository.notification.NotificationRepository;
import com.cho2hand.marketplace.repository.report.ListingReportRepository;
import com.cho2hand.marketplace.repository.trust.ListingTransactionRepository;
import com.cho2hand.marketplace.repository.trust.SellerReviewRepository;
import com.cho2hand.marketplace.repository.user.UserRepository;
import com.cho2hand.marketplace.request.admin.AdminCategoryRequest;
import com.cho2hand.marketplace.request.admin.AdminNotificationRequest;
import com.cho2hand.marketplace.request.admin.AdminUserRolesRequest;
import com.cho2hand.marketplace.service.admin.AdminService;
import com.cho2hand.marketplace.service.notification.NotificationService;
import com.cho2hand.marketplace.service.listing.ListingService;
import com.cho2hand.marketplace.service.storage.StorageHealthService;
import com.cho2hand.marketplace.security.RateLimitFilter;
import org.springframework.jdbc.core.JdbcTemplate;
import java.time.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {
    private static final long ACTIVE_LISTING = 1L;
    private static final long ARCHIVED_LISTING = 3L;
    private static final long ACTIVE_USER = 1L;
    private static final long SUSPENDED_USER = 2L;
    private static final ZoneId HO_CHI_MINH = ZoneId.of("Asia/Ho_Chi_Minh");
    private final ListingReportRepository reports;
    private final ListingRepository listings;
    private final UserRepository users;
    private final UserRoleRepository userRoles;
    private final CategoryRepository categories;
    private final LocationRepository locations;
    private final ListingTransactionRepository transactions;
    private final SellerReviewRepository reviews;
    private final NotificationRepository notifications;
    private final NotificationService notificationService;
    private final AdminAuditLogRepository auditLogs;
    private final RoleRepository roles;
    private final UserAuthIdentityRepository identities;
    private final RateLimitFilter rateLimitFilter;
    private final StorageHealthService storageHealthService;
    private final JdbcTemplate jdbc;
    private final ListingService listingService;

    public AdminServiceImpl(ListingReportRepository reports, ListingRepository listings,
            UserRepository users, UserRoleRepository userRoles, CategoryRepository categories,
            LocationRepository locations, ListingTransactionRepository transactions,
            SellerReviewRepository reviews, NotificationRepository notifications,
            NotificationService notificationService, AdminAuditLogRepository auditLogs, RoleRepository roles,
            UserAuthIdentityRepository identities, RateLimitFilter rateLimitFilter,
            StorageHealthService storageHealthService, JdbcTemplate jdbc, ListingService listingService) {
        this.reports = reports;
        this.listings = listings;
        this.users = users;
        this.userRoles = userRoles;
        this.categories = categories;
        this.locations = locations;
        this.transactions = transactions;
        this.reviews = reviews;
        this.notifications = notifications;
        this.notificationService = notificationService;
        this.auditLogs = auditLogs;
        this.roles = roles;
        this.identities = identities;
        this.rateLimitFilter = rateLimitFilter;
        this.storageHealthService = storageHealthService;
        this.jdbc = jdbc;
        this.listingService = listingService;
    }

    @Override @Transactional(readOnly = true)
    public AdminStatsResponse stats() {
        var start = LocalDate.now(HO_CHI_MINH).atStartOfDay(HO_CHI_MINH).toInstant();
        return new AdminStatsResponse(users.count(), listings.count(),
                listings.countByListingStatusIdAndArchivedAtIsNull(ACTIVE_LISTING),
                listings.countByArchivedAtIsNotNull(),
                listings.countByPublishedAtGreaterThanEqualAndArchivedAtIsNull(start),
                reports.count(), reports.countByStatus("OPEN"));
    }

    @Override @Transactional(readOnly = true)
    public Page<AdminUserResponse> users(String query, Long statusId, Pageable pageable) {
        var page = users.searchForAdmin(normalize(query), statusId, pageable);
        var ids = page.getContent().stream().map(user -> user.getId()).toList();
        if (ids.isEmpty()) return new PageImpl<>(List.of(), pageable, page.getTotalElements());
        Map<Long, List<String>> rolesByUser = new HashMap<>();
        userRoles.findRoleCodesByUserIds(ids).forEach(row ->
                rolesByUser.computeIfAbsent(row.getUserId(), ignored -> new ArrayList<>()).add(row.getRoleCode()));
        var listingCounts = listings.countBySellerUserIds(ids).stream().collect(Collectors.toMap(
                ListingRepository.SellerListingCount::getSellerUserId,
                ListingRepository.SellerListingCount::getListingCount));
        return page.map(user -> new AdminUserResponse(user.getId(), user.getDisplayName(), user.getUserStatusId(),
                    userStatus(user.getUserStatusId()), user.getJoinedAt(), user.getLastActiveAt(),
                    listingCounts.getOrDefault(user.getId(), 0L), rolesByUser.getOrDefault(user.getId(), List.of())));
    }

    @Override
    public void setUserSuspended(Long adminUserId, Long userId, boolean suspended) {
        if (Objects.equals(adminUserId, userId)) throw new AdminOperationException("Không thể khóa tài khoản đang đăng nhập.");
        if (userRoles.findRoleCodesByUserId(userId).contains("ADMIN"))
            throw new AdminOperationException("Không thể thay đổi trạng thái quản trị viên khác.");
        users.findById(userId).orElseThrow(() -> new UserNotFoundException(userId))
                .setUserStatusId(suspended ? SUSPENDED_USER : ACTIVE_USER);
        audit(adminUserId, suspended ? "SUSPEND_USER" : "ACTIVATE_USER", "USER", userId, null);
    }

    @Override @Transactional(readOnly = true)
    public Page<AdminListingResponse> listings(String query, Boolean archived, Pageable pageable) {
        var page = listings.searchForAdmin(normalize(query), archived, pageable);
        var sellers = users.findAllById(page.getContent().stream().map(Listing::getSellerUserId).distinct().toList())
                .stream().collect(Collectors.toMap(user -> user.getId(), Function.identity()));
        var content = page.getContent().stream().map(listing -> new AdminListingResponse(listing.getId(),
                listing.getTitle(), listing.getPriceAmount(), listing.getCurrencyCode(), listing.getSellerUserId(),
                Optional.ofNullable(sellers.get(listing.getSellerUserId())).map(user -> user.getDisplayName()).orElse("Không rõ"),
                listing.getCategoryId(), listing.getListingStatusId(), listingStatus(listing),
                listing.getPublishedAt(), listing.getArchivedAt())).toList();
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    @Override
    public ListingResponse updateListing(Long adminUserId, Long id, UpdateListingRequest request) {
        var updated = listingService.updateAsAdmin(id, request);
        audit(adminUserId, "UPDATE_LISTING", "LISTING", id, updated.title());
        return updated;
    }

    @Override @Transactional(readOnly = true)
    public Page<AdminReportResponse> reports(Pageable pageable) {
        return reports.findAllByOrderByCreatedAtDesc(pageable).map(report -> new AdminReportResponse(
                report.getId(), report.getListingId(), report.getReporterUserId(), report.getReasonId(),
                report.getDetails(), report.getStatus(), report.getResolutionNote(), report.getResolvedAt(),
                report.getCreatedAt()));
    }

    @Override public void archive(Long adminUserId, Long id) {
        var listing = listings.findById(id).orElseThrow(() -> new ListingNotFoundException(id));
        listing.setArchivedAt(Instant.now());
        listing.setListingStatusId(ARCHIVED_LISTING);
        audit(adminUserId, "ARCHIVE_LISTING", "LISTING", id, "Tin đã được ẩn khỏi marketplace");
    }

    @Override public void restore(Long adminUserId, Long id) {
        var listing = listings.findById(id).orElseThrow(() -> new ListingNotFoundException(id));
        listing.setArchivedAt(null);
        listing.setListingStatusId(ACTIVE_LISTING);
        audit(adminUserId, "RESTORE_LISTING", "LISTING", id, "Tin đã được khôi phục và hiển thị lại");
    }

    @Override public void resolve(Long admin, Long reportId, boolean archive) {
        var report = reports.findById(reportId)
                .orElseThrow(() -> new LookupValueNotFoundException("Report", reportId.toString()));
        if (archive) archive(admin, report.getListingId());
        report.resolve(archive ? "ARCHIVED" : "DISMISSED", null, admin);
        audit(admin, archive ? "ARCHIVE_REPORT" : "DISMISS_REPORT", "REPORT", reportId, null);
    }

    @Override @Transactional(readOnly = true)
    public List<AdminCategoryResponse> categories() {
        return categories.findAllByOrderBySortOrderAscNameAsc().stream().map(AdminServiceImpl::categoryResponse).toList();
    }

    @Override
    public AdminCategoryResponse createCategory(Long adminUserId, AdminCategoryRequest request) {
        validateCategory(null, request);
        var saved = categories.save(applyCategory(new Category(), request));
        audit(adminUserId, "CREATE_CATEGORY", "CATEGORY", saved.getId(), saved.getName());
        return categoryResponse(saved);
    }

    @Override
    public AdminCategoryResponse updateCategory(Long adminUserId, Long id, AdminCategoryRequest request) {
        var category = categories.findById(id)
                .orElseThrow(() -> new LookupValueNotFoundException("Category", id.toString()));
        validateCategory(id, request);
        var saved = categories.save(applyCategory(category, request));
        audit(adminUserId, "UPDATE_CATEGORY", "CATEGORY", id, saved.getName());
        return categoryResponse(saved);
    }

    @Override @Transactional(readOnly = true)
    public Page<AdminLocationResponse> locations(String query, Byte level, Pageable pageable) {
        return locations.searchForAdmin(normalize(query), level, pageable).map(location ->
                new AdminLocationResponse(location.getId(), location.getParentLocationId(), location.getLevel(),
                        location.getName(), location.getCode(), location.isActive()));
    }

    @Override
    public void setLocationActive(Long adminUserId, Long id, boolean active) {
        locations.findById(id).orElseThrow(() -> new LookupValueNotFoundException("Location", id.toString()))
                .setActive(active);
        audit(adminUserId, active ? "ACTIVATE_LOCATION" : "DEACTIVATE_LOCATION", "LOCATION", id, null);
    }

    @Override @Transactional(readOnly = true)
    public AdminOperationsStatsResponse operationsStats() {
        return new AdminOperationsStatsResponse(transactions.count(), transactions.countByStatus("CONFIRMED"),
                reviews.count(), reviews.countByStatus("VISIBLE"), reviews.averageVisible(), notifications.count());
    }

    @Override @Transactional(readOnly = true)
    public Page<AdminTransactionResponse> transactions(String status, Pageable pageable) {
        var page = normalize(status) == null ? transactions.findAllByOrderByCreatedAtDesc(pageable)
                : transactions.findByStatusOrderByCreatedAtDesc(status.trim().toUpperCase(Locale.ROOT), pageable);
        return page.map(transaction -> {
            var listing = listings.findById(transaction.getListingId()).orElse(null);
            var buyer = users.findById(transaction.getBuyerUserId()).orElse(null);
            var seller = listing == null ? null : users.findById(listing.getSellerUserId()).orElse(null);
            return new AdminTransactionResponse(transaction.getId(), transaction.getListingId(),
                    listing == null ? "Tin không còn tồn tại" : listing.getTitle(), transaction.getBuyerUserId(),
                    buyer == null ? "Không rõ" : buyer.getDisplayName(), listing == null ? null : listing.getSellerUserId(),
                    seller == null ? "Không rõ" : seller.getDisplayName(), transaction.getStatus(),
                    transaction.getSellerConfirmedAt(), transaction.getBuyerConfirmedAt(), transaction.getConfirmedAt());
        });
    }

    @Override @Transactional(readOnly = true)
    public Page<AdminReviewResponse> reviews(String status, Pageable pageable) {
        var page = normalize(status) == null ? reviews.findAllByOrderByCreatedAtDesc(pageable)
                : reviews.findByStatusOrderByCreatedAtDesc(status.trim().toUpperCase(Locale.ROOT), pageable);
        return page.map(review -> {
            var transaction = transactions.findById(review.getTransactionId()).orElse(null);
            var listing = transaction == null ? null : listings.findById(transaction.getListingId()).orElse(null);
            var seller = listing == null ? null : users.findById(listing.getSellerUserId()).orElse(null);
            return new AdminReviewResponse(review.getId(), review.getTransactionId(),
                    transaction == null ? null : transaction.getListingId(),
                    transaction == null ? null : transaction.getBuyerUserId(),
                    listing == null ? null : listing.getSellerUserId(), seller == null ? "Không rõ" : seller.getDisplayName(),
                    review.getRating(), review.getBody(), review.getStatus(), review.getCreatedAt());
        });
    }

    @Override
    public void setReviewVisible(Long adminUserId, Long id, boolean visible) {
        reviews.findById(id).orElseThrow(() -> new LookupValueNotFoundException("Review", id.toString()))
                .setStatus(visible ? "VISIBLE" : "HIDDEN");
        audit(adminUserId, visible ? "RESTORE_REVIEW" : "HIDE_REVIEW", "REVIEW", id, null);
    }

    @Override
    public void sendNotification(Long adminUserId, AdminNotificationRequest request) {
        if (!users.existsById(request.recipientUserId())) throw new UserNotFoundException(request.recipientUserId());
        notificationService.create(request.recipientUserId(), "SYSTEM", request.body(),
                normalize(request.referencePath()) == null ? "/thong-bao" : request.referencePath().trim());
        audit(adminUserId, "SEND_NOTIFICATION", "USER", request.recipientUserId(), null);
    }

    @Override @Transactional(readOnly = true)
    public Page<AdminAuditResponse> auditLogs(Pageable pageable) {
        var page = auditLogs.findAllByOrderByCreatedAtDesc(pageable);
        var admins = users.findAllById(page.getContent().stream().map(AdminAuditLog::getAdminUserId).distinct().toList())
                .stream().collect(Collectors.toMap(user -> user.getId(), user -> user.getDisplayName()));
        return page.map(item -> new AdminAuditResponse(item.getId(), item.getAdminUserId(),
                admins.getOrDefault(item.getAdminUserId(), "Không rõ"), item.getAction(), item.getTargetType(),
                item.getTargetId(), item.getDetails(), item.getCreatedAt()));
    }

    @Override @Transactional(readOnly = true)
    public AdminHealthResponse health() {
        String database = "UP", storage = "UP";
        try { jdbc.queryForObject("select 1", Integer.class); } catch (RuntimeException exception) { database = "DOWN"; }
        try { storageHealthService.ensureReady(); } catch (RuntimeException exception) { storage = "DOWN"; }
        var now = Instant.now();
        return new AdminHealthResponse("UP", database, storage, rateLimitFilter.blockedRequests(),
                identities.countByFailedLoginAttemptsGreaterThan(0), identities.countByLockedUntilAfter(now), now);
    }

    @Override
    public void setAdminRole(Long adminUserId, Long userId, boolean enabled) {
        if (Objects.equals(adminUserId, userId)) throw new AdminOperationException("Không thể tự thay đổi quyền quản trị.");
        if (!users.existsById(userId)) throw new UserNotFoundException(userId);
        var role = roles.findByCodeAndActiveTrue("ADMIN").orElseThrow();
        var id = new UserRoleId(userId, role.getId());
        if (enabled) userRoles.findById(id).orElseGet(() -> userRoles.save(new UserRole(userId, role.getId())));
        else {
            if (userRoles.countByIdRoleId(role.getId()) <= 1) throw new AdminOperationException("Hệ thống phải còn ít nhất một quản trị viên.");
            userRoles.deleteById(id);
        }
        audit(adminUserId, enabled ? "GRANT_ADMIN" : "REVOKE_ADMIN", "USER", userId, null);
    }

    @Override @Transactional(readOnly = true)
    public List<AdminRoleResponse> roles() {
        return roles.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .map(role -> new AdminRoleResponse(role.getId(), role.getCode(), role.getDisplayName(), role.isActive()))
                .toList();
    }

    @Override @Transactional(readOnly = true)
    public List<AdminPermissionResponse> permissions() {
        return jdbc.query("select permission_id, code, display_name, is_active from permissions order by permission_id",
                (rs, row) -> new AdminPermissionResponse(rs.getLong("permission_id"), rs.getString("code"),
                        rs.getString("display_name"), rs.getBoolean("is_active")));
    }

    @Override
    public void setUserRoles(Long adminUserId, Long userId, AdminUserRolesRequest request) {
        if (Objects.equals(adminUserId, userId))
            throw new AdminOperationException("Không thể tự thay đổi quyền của chính mình.");
        if (!users.existsById(userId)) throw new UserNotFoundException(userId);

        var managedCodes = List.of("STAFF_CUSTOMER", "STAFF_CONTENT", "ADMIN");
        var requested = request.roleCodes().stream().map(String::trim).distinct().toList();
        if (!managedCodes.containsAll(requested))
            throw new AdminOperationException("Vai trò không được phép quản lý.");

        var current = new HashSet<>(userRoles.findRoleCodesByUserId(userId));
        if (current.contains("ADMIN") && !requested.contains("ADMIN")
                && userRoles.countByIdRoleId(managedRole("ADMIN").getId()) <= 1)
            throw new AdminOperationException("Hệ thống phải còn ít nhất một quản trị viên.");

        for (String code : managedCodes) {
            var role = managedRole(code);
            var link = new UserRoleId(userId, role.getId());
            if (requested.contains(code) && !userRoles.existsById(link))
                userRoles.save(new UserRole(userId, role.getId()));
            else if (!requested.contains(code) && userRoles.existsById(link))
                userRoles.deleteById(link);
        }
        audit(adminUserId, "UPDATE_USER_ROLES", "USER", userId, String.join(",", requested));
    }

    private com.cho2hand.marketplace.entity.auth.Role managedRole(String code) {
        return roles.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new AdminOperationException("Vai trò không khả dụng: " + code));
    }

    private void audit(Long admin, String action, String targetType, Long targetId, String details) {
        auditLogs.save(new AdminAuditLog().record(admin, action, targetType, targetId, details));
    }

    private void validateCategory(Long id, AdminCategoryRequest request) {
        if (Objects.equals(id, request.parentId())) throw new AdminOperationException("Danh mục không thể là cha của chính nó.");
        if (request.parentId() != null && !categories.existsById(request.parentId()))
            throw new LookupValueNotFoundException("Parent category", request.parentId().toString());
        categories.findAllByOrderBySortOrderAscNameAsc().stream()
                .filter(item -> item.getSlug().equals(request.slug()) && !Objects.equals(item.getId(), id))
                .findFirst().ifPresent(item -> { throw new AdminOperationException("Slug danh mục đã tồn tại."); });
    }

    private static Category applyCategory(Category category, AdminCategoryRequest request) {
        category.setParentCategoryId(request.parentId());
        category.setName(request.name().trim());
        category.setSlug(request.slug().trim());
        category.setLeaf(request.leaf());
        category.setSortOrder(request.sortOrder());
        category.setActive(request.active());
        return category;
    }

    private static AdminCategoryResponse categoryResponse(Category category) {
        return new AdminCategoryResponse(category.getId(), category.getParentCategoryId(), category.getName(),
                category.getSlug(), category.isLeaf(), category.getSortOrder(), category.isActive());
    }

    private static String normalize(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private static String userStatus(Long id) { return id == SUSPENDED_USER ? "Tạm khóa" : id == ACTIVE_USER ? "Hoạt động" : "Đã xóa"; }
    private static String listingStatus(Listing listing) {
        if (listing.getArchivedAt() != null || listing.getListingStatusId() == ARCHIVED_LISTING) return "Đã ẩn";
        return listing.getListingStatusId() == ACTIVE_LISTING ? "Đang bán" : "Đã bán";
    }
}
