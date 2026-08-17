package com.cho2hand.marketplace.service.impl.admin;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.cho2hand.marketplace.entity.listing.Listing;
import com.cho2hand.marketplace.entity.user.User;
import com.cho2hand.marketplace.dto.listing.ListingResponse;
import com.cho2hand.marketplace.dto.listing.UpdateListingRequest;
import com.cho2hand.marketplace.exception.AdminOperationException;
import com.cho2hand.marketplace.repository.auth.UserRoleRepository;
import com.cho2hand.marketplace.repository.category.CategoryRepository;
import com.cho2hand.marketplace.repository.listing.ListingRepository;
import com.cho2hand.marketplace.repository.location.LocationRepository;
import com.cho2hand.marketplace.repository.notification.NotificationRepository;
import com.cho2hand.marketplace.repository.report.ListingReportRepository;
import com.cho2hand.marketplace.repository.trust.ListingTransactionRepository;
import com.cho2hand.marketplace.repository.trust.SellerReviewRepository;
import com.cho2hand.marketplace.repository.user.UserRepository;
import com.cho2hand.marketplace.service.notification.NotificationService;
import com.cho2hand.marketplace.service.listing.ListingService;
import com.cho2hand.marketplace.repository.admin.AdminAuditLogRepository;
import com.cho2hand.marketplace.repository.auth.RoleRepository;
import com.cho2hand.marketplace.repository.auth.UserAuthIdentityRepository;
import com.cho2hand.marketplace.security.RateLimitFilter;
import com.cho2hand.marketplace.service.storage.StorageHealthService;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.Optional;
import java.util.List;
import com.cho2hand.marketplace.request.admin.AdminUserRolesRequest;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

class AdminServiceImplTest {
    private final ListingReportRepository reports = mock(ListingReportRepository.class);
    private final ListingRepository listings = mock(ListingRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final UserRoleRepository userRoles = mock(UserRoleRepository.class);
    private final RoleRepository roleRepository = mock(RoleRepository.class);
    private final CategoryRepository categories = mock(CategoryRepository.class);
    private final LocationRepository locations = mock(LocationRepository.class);
    private final ListingTransactionRepository transactions = mock(ListingTransactionRepository.class);
    private final SellerReviewRepository reviews = mock(SellerReviewRepository.class);
    private final NotificationRepository notifications = mock(NotificationRepository.class);
    private final NotificationService notificationService = mock(NotificationService.class);
    private final AdminAuditLogRepository auditLogs = mock(AdminAuditLogRepository.class);
    private final ListingService listingService = mock(ListingService.class);
    private final AdminServiceImpl service = new AdminServiceImpl(reports, listings, users, userRoles, categories,
            locations, transactions, reviews, notifications, notificationService, auditLogs, roleRepository,
            mock(UserAuthIdentityRepository.class), mock(RateLimitFilter.class), mock(StorageHealthService.class),
            mock(JdbcTemplate.class), listingService);

    @Test void adminCannotSuspendItself() {
        assertThrows(AdminOperationException.class, () -> service.setUserSuspended(7L, 7L, true));
        verifyNoInteractions(users);
    }

    @Test void archiveUpdatesVisibilityAndStatus() {
        var listing = new Listing();
        when(listings.findById(5L)).thenReturn(Optional.of(listing));
        service.archive(9L, 5L);
        assertNotNull(listing.getArchivedAt());
        assertEquals(3L, listing.getListingStatusId());
        verify(auditLogs).save(any());
    }

    @Test void adminListingUpdateIsAudited() {
        var request = mock(UpdateListingRequest.class);
        var response = mock(ListingResponse.class);
        when(response.title()).thenReturn("Toyota Vios đã duyệt");
        when(listingService.updateAsAdmin(5L, request)).thenReturn(response);

        assertSame(response, service.updateListing(9L, 5L, request));

        verify(auditLogs).save(argThat(log -> log.getAdminUserId().equals(9L)
                && log.getAction().equals("UPDATE_LISTING") && log.getTargetId().equals(5L)));
    }

    @Test void usersLoadsRolesAndListingCountsInBulk() {
        var first = user(7L, "An");
        var second = user(8L, "Bình");
        var role = mock(UserRoleRepository.UserRoleCodeView.class);
        when(role.getUserId()).thenReturn(7L);
        when(role.getRoleCode()).thenReturn("ADMIN");
        var count = mock(ListingRepository.SellerListingCount.class);
        when(count.getSellerUserId()).thenReturn(7L);
        when(count.getListingCount()).thenReturn(3L);
        var pageable = PageRequest.of(0, 20);
        when(users.searchForAdmin(null, null, pageable)).thenReturn(new PageImpl<>(List.of(first, second), pageable, 2));
        when(userRoles.findRoleCodesByUserIds(List.of(7L, 8L))).thenReturn(List.of(role));
        when(listings.countBySellerUserIds(List.of(7L, 8L))).thenReturn(List.of(count));

        var result = service.users(null, null, pageable);

        assertEquals(List.of("ADMIN"), result.getContent().getFirst().roles());
        assertEquals(3L, result.getContent().getFirst().listingCount());
        assertEquals(0L, result.getContent().get(1).listingCount());
        verify(userRoles, never()).findRoleCodesByUserId(anyLong());
        verify(listings, never()).countBySellerUserId(anyLong());
    }

    @Test void rejectsUnsupportedStaffRole() {
        when(users.existsById(8L)).thenReturn(true);
        assertThrows(AdminOperationException.class,
                () -> service.setUserRoles(9L, 8L, new AdminUserRolesRequest(List.of("MODERATOR"))));
        verifyNoInteractions(roleRepository);
    }

    @Test void cannotRemoveLastAdmin() {
        when(users.existsById(8L)).thenReturn(true);
        when(userRoles.findRoleCodesByUserId(8L)).thenReturn(List.of("ADMIN"));
        var adminRole = mock(com.cho2hand.marketplace.entity.auth.Role.class);
        when(adminRole.getId()).thenReturn(3L);
        when(roleRepository.findByCodeAndActiveTrue("ADMIN")).thenReturn(Optional.of(adminRole));
        when(userRoles.countByIdRoleId(3L)).thenReturn(1L);

        assertThrows(AdminOperationException.class,
                () -> service.setUserRoles(9L, 8L, new AdminUserRolesRequest(List.of())));
        verify(userRoles, never()).deleteById(any());
    }

    private static User user(Long id, String name) {
        var user = new User();
        ReflectionTestUtils.setField(user, "id", id);
        user.setDisplayName(name);
        user.setUserStatusId(1L);
        return user;
    }
}
