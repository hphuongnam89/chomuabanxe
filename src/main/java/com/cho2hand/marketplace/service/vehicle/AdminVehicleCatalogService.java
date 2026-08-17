package com.cho2hand.marketplace.service.vehicle;

import com.cho2hand.marketplace.dto.admin.AdminVehicleCatalogResponse;
import com.cho2hand.marketplace.dto.admin.AdminVehicleOptionRequest;
import com.cho2hand.marketplace.dto.admin.AdminVehicleOptionResponse;
import com.cho2hand.marketplace.entity.admin.AdminAuditLog;
import com.cho2hand.marketplace.exception.AdminOperationException;
import com.cho2hand.marketplace.exception.LookupValueNotFoundException;
import com.cho2hand.marketplace.repository.admin.AdminAuditLogRepository;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminVehicleCatalogService {
    private static final Map<String, Resource> RESOURCES = Map.ofEntries(
            Map.entry("brands", new Resource("vehicle_brands", "vehicle_brand_id", null, "name")),
            Map.entry("models", new Resource("vehicle_models", "vehicle_model_id", "vehicle_brand_id", "name")),
            Map.entry("origins", new Resource("vehicle_origins", "vehicle_origin_id", null, "display_name")),
            Map.entry("transmissions", new Resource("vehicle_transmissions", "vehicle_transmission_id", null, "display_name")),
            Map.entry("fuels", new Resource("vehicle_fuels", "vehicle_fuel_id", null, "display_name")),
            Map.entry("colors", new Resource("vehicle_colors", "vehicle_color_id", null, "display_name")),
            Map.entry("body-types", new Resource("vehicle_body_types", "vehicle_body_type_id", null, "display_name")),
            Map.entry("drivelines", new Resource("vehicle_drivelines", "vehicle_driveline_id", null, "display_name")));

    private final JdbcTemplate jdbc;
    private final AdminAuditLogRepository auditLogs;

    public AdminVehicleCatalogService(JdbcTemplate jdbc, AdminAuditLogRepository auditLogs) {
        this.jdbc = jdbc;
        this.auditLogs = auditLogs;
    }

    @Transactional(readOnly = true)
    public AdminVehicleCatalogResponse catalog() {
        return new AdminVehicleCatalogResponse(list("brands"), list("models"), list("origins"),
                list("transmissions"), list("fuels"), list("colors"), list("body-types"), list("drivelines"));
    }

    public AdminVehicleOptionResponse create(Long adminId, String rawResource, AdminVehicleOptionRequest request) {
        var resource = resource(rawResource);
        var code = validate(resource, request, null);
        ensureCodeAvailable(resource, code, request.parentId(), null);
        var columns = resource.parentColumn == null
                ? "code, " + resource.nameColumn + ", sort_order, is_active"
                : resource.parentColumn + ", code, " + resource.nameColumn + ", sort_order, is_active";
        var placeholders = resource.parentColumn == null ? "?,?,?,?" : "?,?,?,?,?";
        var sql = "insert into " + resource.table + " (" + columns + ") values (" + placeholders + ")";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            var statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            var index = 1;
            if (resource.parentColumn != null) statement.setLong(index++, request.parentId());
            statement.setString(index++, code);
            statement.setString(index++, request.name().trim());
            statement.setInt(index++, request.sortOrder());
            statement.setBoolean(index, request.active());
            return statement;
        }, keyHolder);
        var id = keyHolder.getKey();
        if (id == null) throw new AdminOperationException("Không thể tạo mục catalog.");
        auditLogs.save(audit(adminId, "CREATE_VEHICLE_" + rawResource.toUpperCase(Locale.ROOT), id.longValue(), code));
        return find(resource, id.longValue());
    }

    public AdminVehicleOptionResponse update(Long adminId, String rawResource, Long id,
            AdminVehicleOptionRequest request) {
        var resource = resource(rawResource);
        var code = validate(resource, request, id);
        ensureCodeAvailable(resource, code, request.parentId(), id);
        var assignments = resource.parentColumn == null
                ? "code=?, " + resource.nameColumn + "=?, sort_order=?, is_active=?"
                : resource.parentColumn + "=?, code=?, " + resource.nameColumn + "=?, sort_order=?, is_active=?";
        var sql = "update " + resource.table + " set " + assignments + " where " + resource.idColumn + "=?";
        var args = new ArrayList<>();
        if (resource.parentColumn != null) args.add(request.parentId());
        args.add(code);
        args.add(request.name().trim());
        args.add(request.sortOrder());
        args.add(request.active());
        args.add(id);
        if (jdbc.update(sql, args.toArray()) == 0) throw notFound(resource, id);
        auditLogs.save(audit(adminId, "UPDATE_VEHICLE_" + rawResource.toUpperCase(Locale.ROOT), id, code));
        return find(resource, id);
    }

    public void setActive(Long adminId, String rawResource, Long id, boolean active) {
        var resource = resource(rawResource);
        var current = find(resource, id);
        jdbc.update("update " + resource.table + " set is_active=? where " + resource.idColumn + "=?", active, id);
        auditLogs.save(audit(adminId, (active ? "ACTIVATE_" : "DEACTIVATE_")
                + "VEHICLE_" + rawResource.toUpperCase(Locale.ROOT), id, current.code()));
    }

    @Transactional(readOnly = true)
    private List<AdminVehicleOptionResponse> list(String rawResource) {
        var resource = resource(rawResource);
        var parent = resource.parentColumn == null ? "NULL" : resource.parentColumn;
        var sql = "select " + resource.idColumn + " as option_id, " + parent
                + " as parent_id, code, " + resource.nameColumn + " as option_name, sort_order, is_active"
                + " from " + resource.table + " order by sort_order asc, option_name asc";
        return jdbc.query(sql, (rs, row) -> new AdminVehicleOptionResponse(rs.getLong("option_id"),
                rs.getObject("parent_id", Long.class), rs.getString("code"), rs.getString("option_name"),
                rs.getShort("sort_order"), rs.getBoolean("is_active")));
    }

    @Transactional(readOnly = true)
    private AdminVehicleOptionResponse find(Resource resource, Long id) {
        var parent = resource.parentColumn == null ? "NULL" : resource.parentColumn;
        var sql = "select " + resource.idColumn + " as option_id, " + parent
                + " as parent_id, code, " + resource.nameColumn + " as option_name, sort_order, is_active"
                + " from " + resource.table + " where " + resource.idColumn + "=?";
        return jdbc.query(sql, (rs, row) -> new AdminVehicleOptionResponse(rs.getLong("option_id"),
                rs.getObject("parent_id", Long.class), rs.getString("code"), rs.getString("option_name"),
                rs.getShort("sort_order"), rs.getBoolean("is_active")), id).stream().findFirst()
                .orElseThrow(() -> notFound(resource, id));
    }

    private String validate(Resource resource, AdminVehicleOptionRequest request, Long id) {
        var code = request.code().trim().toLowerCase(Locale.ROOT);
        var name = request.name().trim();
        if (!code.matches("[a-z0-9][a-z0-9-]*") || name.isBlank())
            throw new AdminOperationException("Mã hoặc tên catalog không hợp lệ.");
        if (resource.parentColumn == null && request.parentId() != null)
            throw new AdminOperationException("Mục catalog này không nhận hãng cha.");
        if (resource.parentColumn != null) {
            if (request.parentId() == null)
                throw new AdminOperationException("Mẫu xe phải thuộc một hãng xe.");
            var parentExists = jdbc.queryForObject(
                    "select count(*) from vehicle_brands where vehicle_brand_id=? and is_active=true",
                    Integer.class, request.parentId());
            if (parentExists == null || parentExists == 0)
                throw new LookupValueNotFoundException("Active vehicle brand", request.parentId().toString());
        }
        return code;
    }

    private void ensureCodeAvailable(Resource resource, String code, Long parentId, Long id) {
        var sql = "select count(*) from " + resource.table + " where code=?";
        var args = new ArrayList<>();
        args.add(code);
        if (resource.parentColumn != null) {
            sql += " and " + resource.parentColumn + "=?";
            args.add(parentId);
        }
        if (id != null) {
            sql += " and " + resource.idColumn + "<>?";
            args.add(id);
        }
        var count = jdbc.queryForObject(sql, Integer.class, args.toArray());
        if (count != null && count > 0) throw new AdminOperationException("Mã catalog đã tồn tại.");
    }

    private Resource resource(String rawResource) {
        var resource = RESOURCES.get(rawResource == null ? "" : rawResource.trim().toLowerCase(Locale.ROOT));
        if (resource == null) throw new AdminOperationException("Loại catalog xe không được hỗ trợ.");
        return resource;
    }

    private static LookupValueNotFoundException notFound(Resource resource, Long id) {
        return new LookupValueNotFoundException("Vehicle " + resource.table, id.toString());
    }

    private static AdminAuditLog audit(Long adminId, String action, Long id, String details) {
        return new AdminAuditLog().record(adminId, action, "VEHICLE_CATALOG", id, details);
    }

    private record Resource(String table, String idColumn, String parentColumn, String nameColumn) { }
}
