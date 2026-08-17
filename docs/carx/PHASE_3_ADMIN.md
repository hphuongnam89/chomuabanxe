# CarX — Phase 3: Admin và phân quyền

## Phạm vi đã hoàn tất

- Quản trị catalog xe: hãng, mẫu, xuất xứ, hộp số, nhiên liệu, màu, kiểu dáng, dẫn động.
- CRUD catalog có kiểm tra mã, trạng thái hoạt động, thứ tự hiển thị và quan hệ mẫu xe thuộc hãng xe.
- Ghi audit log cho mọi thay đổi catalog và thay đổi vai trò.
- RBAC dựa trên permission, deny-by-default ở các endpoint admin.
- Vai trò vận hành: `STAFF_CUSTOMER`, `STAFF_CONTENT`, `ADMIN`.
- Bảo vệ quản trị viên cuối cùng và cấm người dùng tự thay đổi quyền của mình.

## API chính

```text
GET    /api/v1/admin/vehicle-catalog
POST   /api/v1/admin/vehicle-catalog/{resource}
PUT    /api/v1/admin/vehicle-catalog/{resource}/{id}
PATCH  /api/v1/admin/vehicle-catalog/{resource}/{id}/activate
PATCH  /api/v1/admin/vehicle-catalog/{resource}/{id}/deactivate
GET    /api/v1/admin/roles
GET    /api/v1/admin/permissions
PUT    /api/v1/admin/users/{id}/roles
```

`resource` chỉ nhận: `brands`, `models`, `origins`, `transmissions`, `fuels`, `colors`, `body-types`, `drivelines`.

## Migration

- `V25__create_permissions.sql`: tạo bảng permission/role-permission và hai role nhân viên.
- `V26__seed_permissions.sql`: seed 11 permission CarX.
- `V27__seed_role_permissions.sql`: gán permission cho nhân viên và toàn quyền cho `ADMIN`.

## Giao diện

`/admin` đã có tab `Catalog xe`; tab Người dùng cho phép bật/tắt `CSKH`, `Nội dung` và `Admin`.

## Kiểm tra đạt

- `mvn -q test` — đạt.
- `mvn -q -DskipTests compile` — đạt.
- `npm run build` trong `frontend` — đạt.
- Unit test bao phủ resource catalog không hợp lệ, role không được phép và bảo vệ admin cuối cùng.

Flyway SQL đã được chạy smoke test trên MySQL 9.6 tạm thời; chưa chạy trên database dữ liệu thật.
