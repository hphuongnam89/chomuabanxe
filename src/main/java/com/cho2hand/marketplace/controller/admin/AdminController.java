package com.cho2hand.marketplace.controller.admin;

import com.cho2hand.marketplace.dto.admin.AdminListingResponse;
import com.cho2hand.marketplace.dto.admin.AdminCategoryResponse;
import com.cho2hand.marketplace.dto.admin.AdminLocationResponse;
import com.cho2hand.marketplace.dto.admin.AdminOperationsStatsResponse;
import com.cho2hand.marketplace.dto.admin.AdminReviewResponse;
import com.cho2hand.marketplace.dto.admin.AdminTransactionResponse;
import com.cho2hand.marketplace.dto.admin.AdminUserResponse;
import com.cho2hand.marketplace.dto.admin.AdminVehicleCatalogResponse;
import com.cho2hand.marketplace.dto.admin.AdminVehicleOptionRequest;
import com.cho2hand.marketplace.dto.admin.AdminVehicleOptionResponse;
import com.cho2hand.marketplace.dto.admin.AdminRoleResponse;
import com.cho2hand.marketplace.dto.admin.AdminPermissionResponse;
import com.cho2hand.marketplace.dto.report.AdminReportResponse;
import com.cho2hand.marketplace.dto.report.AdminStatsResponse;
import com.cho2hand.marketplace.service.admin.AdminService;
import com.cho2hand.marketplace.service.vehicle.AdminVehicleCatalogService;
import com.cho2hand.marketplace.dto.listing.ListingResponse;
import com.cho2hand.marketplace.dto.listing.UpdateListingRequest;
import com.cho2hand.marketplace.dto.common.PageResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.Valid;
import com.cho2hand.marketplace.request.admin.AdminCategoryRequest;
import com.cho2hand.marketplace.request.admin.AdminNotificationRequest;
import com.cho2hand.marketplace.request.admin.AdminUserRolesRequest;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final AdminService service;
    private final AdminVehicleCatalogService vehicleCatalog;
    public AdminController(AdminService service, AdminVehicleCatalogService vehicleCatalog) {
        this.service = service;
        this.vehicleCatalog = vehicleCatalog;
    }

    @GetMapping("/stats") public AdminStatsResponse stats() { return service.stats(); }
    @GetMapping("/users")
    public PageResponse<AdminUserResponse> users(@RequestParam(required = false) String query,
            @RequestParam(required = false) Long statusId,
            @RequestParam(defaultValue = "0") @PositiveOrZero int page,
            @RequestParam(defaultValue = "20") @Positive @Max(100) int size) {
        return PageResponse.from(service.users(query, statusId, PageRequest.of(page, size)));
    }
    @PatchMapping("/users/{id}/suspend") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void suspend(@AuthenticationPrincipal Long admin, @PathVariable @Positive Long id) {
        service.setUserSuspended(admin, id, true);
    }
    @PatchMapping("/users/{id}/activate") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(@AuthenticationPrincipal Long admin, @PathVariable @Positive Long id) {
        service.setUserSuspended(admin, id, false);
    }
    @GetMapping("/listings")
    public PageResponse<AdminListingResponse> listings(@RequestParam(required = false) String query,
            @RequestParam(required = false) Boolean archived,
            @RequestParam(defaultValue = "0") @PositiveOrZero int page,
            @RequestParam(defaultValue = "20") @Positive @Max(100) int size) {
        return PageResponse.from(service.listings(query, archived, PageRequest.of(page, size)));
    }
    @GetMapping("/reports")
    public PageResponse<AdminReportResponse> reports(
            @RequestParam(defaultValue = "0") @PositiveOrZero int page,
            @RequestParam(defaultValue = "20") @Positive @Max(100) int size) {
        return PageResponse.from(service.reports(PageRequest.of(page, size)));
    }
    @PatchMapping("/listings/{id}")
    public ListingResponse updateListing(@AuthenticationPrincipal Long admin, @PathVariable @Positive Long id,
            @Valid @RequestBody UpdateListingRequest request) {
        return service.updateListing(admin, id, request);
    }
    @PatchMapping("/listings/{id}/archive") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archive(@AuthenticationPrincipal Long admin, @PathVariable @Positive Long id) { service.archive(admin,id); }
    @PatchMapping("/listings/{id}/restore") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void restore(@AuthenticationPrincipal Long admin, @PathVariable @Positive Long id) { service.restore(admin,id); }
    @PatchMapping("/reports/{id}/dismiss") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void dismiss(@AuthenticationPrincipal Long admin, @PathVariable @Positive Long id) { service.resolve(admin,id,false); }
    @PatchMapping("/reports/{id}/archive") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resolveAndArchive(@AuthenticationPrincipal Long admin, @PathVariable @Positive Long id) { service.resolve(admin,id,true); }

    @GetMapping("/categories") public List<AdminCategoryResponse> categories(){return service.categories();}
    @PostMapping("/categories") @ResponseStatus(HttpStatus.CREATED)
    public AdminCategoryResponse createCategory(@AuthenticationPrincipal Long admin,@Valid @RequestBody AdminCategoryRequest request){return service.createCategory(admin,request);}
    @PutMapping("/categories/{id}")
    public AdminCategoryResponse updateCategory(@AuthenticationPrincipal Long admin,@PathVariable @Positive Long id,@Valid @RequestBody AdminCategoryRequest request){return service.updateCategory(admin,id,request);}
    @GetMapping("/locations")
    public PageResponse<AdminLocationResponse> locations(@RequestParam(required=false) String query,@RequestParam(required=false) Byte level,
            @RequestParam(defaultValue="0") @PositiveOrZero int page,@RequestParam(defaultValue="20") @Positive @Max(100) int size){
        return PageResponse.from(service.locations(query,level,PageRequest.of(page,size)));
    }
    @PatchMapping("/locations/{id}/activate") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activateLocation(@AuthenticationPrincipal Long admin,@PathVariable @Positive Long id){service.setLocationActive(admin,id,true);}
    @PatchMapping("/locations/{id}/deactivate") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateLocation(@AuthenticationPrincipal Long admin,@PathVariable @Positive Long id){service.setLocationActive(admin,id,false);}
    @GetMapping("/operations/stats") public AdminOperationsStatsResponse operationsStats(){return service.operationsStats();}
    @GetMapping("/transactions")
    public PageResponse<AdminTransactionResponse> transactions(@RequestParam(required=false) String status,
            @RequestParam(defaultValue="0") @PositiveOrZero int page,@RequestParam(defaultValue="20") @Positive @Max(100) int size){
        return PageResponse.from(service.transactions(status,PageRequest.of(page,size)));
    }
    @GetMapping("/reviews")
    public PageResponse<AdminReviewResponse> reviews(@RequestParam(required=false) String status,
            @RequestParam(defaultValue="0") @PositiveOrZero int page,@RequestParam(defaultValue="20") @Positive @Max(100) int size){
        return PageResponse.from(service.reviews(status,PageRequest.of(page,size)));
    }
    @PatchMapping("/reviews/{id}/hide") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void hideReview(@AuthenticationPrincipal Long admin,@PathVariable @Positive Long id){service.setReviewVisible(admin,id,false);}
    @PatchMapping("/reviews/{id}/restore") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void restoreReview(@AuthenticationPrincipal Long admin,@PathVariable @Positive Long id){service.setReviewVisible(admin,id,true);}
    @PostMapping("/notifications") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sendNotification(@AuthenticationPrincipal Long admin,@Valid @RequestBody AdminNotificationRequest request){service.sendNotification(admin,request);}
    @GetMapping("/audit-logs")
    public PageResponse<com.cho2hand.marketplace.dto.admin.AdminAuditResponse> auditLogs(
            @RequestParam(defaultValue="0") @PositiveOrZero int page,@RequestParam(defaultValue="30") @Positive @Max(100) int size){
        return PageResponse.from(service.auditLogs(PageRequest.of(page,size)));
    }
    @GetMapping("/health") public com.cho2hand.marketplace.dto.admin.AdminHealthResponse health(){return service.health();}
    @GetMapping("/vehicle-catalog")
    public AdminVehicleCatalogResponse vehicleCatalog() { return vehicleCatalog.catalog(); }
    @PostMapping("/vehicle-catalog/{resource}")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminVehicleOptionResponse createVehicleOption(@AuthenticationPrincipal Long admin,
            @PathVariable String resource, @Valid @RequestBody AdminVehicleOptionRequest request) {
        return vehicleCatalog.create(admin, resource, request);
    }
    @PutMapping("/vehicle-catalog/{resource}/{id}")
    public AdminVehicleOptionResponse updateVehicleOption(@AuthenticationPrincipal Long admin,
            @PathVariable String resource, @PathVariable @Positive Long id,
            @Valid @RequestBody AdminVehicleOptionRequest request) {
        return vehicleCatalog.update(admin, resource, id, request);
    }
    @PatchMapping("/vehicle-catalog/{resource}/{id}/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activateVehicleOption(@AuthenticationPrincipal Long admin, @PathVariable String resource,
            @PathVariable @Positive Long id) { vehicleCatalog.setActive(admin, resource, id, true); }
    @PatchMapping("/vehicle-catalog/{resource}/{id}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateVehicleOption(@AuthenticationPrincipal Long admin, @PathVariable String resource,
            @PathVariable @Positive Long id) { vehicleCatalog.setActive(admin, resource, id, false); }
    @GetMapping("/roles") public List<AdminRoleResponse> roles() { return service.roles(); }
    @GetMapping("/permissions") public List<AdminPermissionResponse> permissions() { return service.permissions(); }
    @PutMapping("/users/{id}/roles")
    public void setUserRoles(@AuthenticationPrincipal Long admin, @PathVariable @Positive Long id,
            @Valid @RequestBody AdminUserRolesRequest request) { service.setUserRoles(admin, id, request); }
    @PatchMapping("/users/{id}/grant-admin") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void grantAdmin(@AuthenticationPrincipal Long admin,@PathVariable @Positive Long id){service.setAdminRole(admin,id,true);}
    @PatchMapping("/users/{id}/revoke-admin") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeAdmin(@AuthenticationPrincipal Long admin,@PathVariable @Positive Long id){service.setAdminRole(admin,id,false);}
}
