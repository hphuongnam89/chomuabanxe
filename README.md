# CarX

CarX là hệ thống đăng tin mua bán ô tô trực tuyến dành cho cá nhân và doanh nghiệp. Người dùng có thể tìm kiếm, đăng tin, trao đổi và theo dõi giao dịch; đội ngũ vận hành quản lý tin, khách hàng, catalog xe và quyền truy cập.

## Chức năng theo yêu cầu PDF

- Đăng ký, đăng nhập, đổi mật khẩu và khôi phục mật khẩu.
- Đăng, sửa, ẩn tin xe; tải nhiều ảnh và quản lý địa điểm.
- Tìm kiếm nhiều tiêu chí: hãng, mẫu, tình trạng, năm, giá, hộp số, nhiên liệu, xuất xứ, màu, kiểu dáng, số chỗ, dẫn động, kilomet và tỉnh/thành.
- Gợi ý xe không cần đăng nhập dựa trên xe đang xem hoặc bộ lọc gần nhất.
- Admin quản lý khách hàng, tin đăng, báo cáo, catalog xe, khu vực và audit log.
- RBAC cho `STAFF_CUSTOMER`, `STAFF_CONTENT` và `ADMIN`.

## Kiến trúc

```text
frontend/                  React + Vite + React Router
src/main/java/             Spring Boot REST API
src/main/resources/db/     Flyway migrations V1-V30
compose.yaml               MySQL + MinIO + backend + frontend
```

Frontend được chia theo trách nhiệm: `app/` chứa shell và route guard,
`components/` chứa UI dùng chung, `features/` chứa màn hình theo nghiệp vụ,
`admin/` chứa từng nhóm vận hành, còn `catalog.js` là nguồn dữ liệu catalog dùng
chung. `App.jsx` chỉ điều phối route và các trang mua bán xe cốt lõi.

Backend dùng Java 21, Spring Boot 3.5, Spring Security, JWT, JPA/Hibernate, Flyway và MySQL. Ảnh được lưu qua MinIO-compatible object storage.

## Chạy local bằng Docker

Yêu cầu: Docker Desktop và Docker Compose.

```bash
cp .env.example .env
# thay JWT_SECRET bằng giá trị Base64 ngẫu nhiên trước khi chia sẻ môi trường
# có thể tạo bằng: openssl rand -base64 32
# lần chạy đầu, đặt ADMIN_BOOTSTRAP_EMAIL và ADMIN_BOOTSTRAP_PASSWORD (tối thiểu 12 ký tự)
# sau khi đăng nhập admin thành công, xóa hai giá trị bootstrap khỏi .env và đổi mật khẩu
# local HTTP dùng false; đặt true khi chạy sau HTTPS
docker compose up --build
# kiểm tra các service: docker compose ps
```

Địa chỉ sau khi các service healthy:

```text
Frontend: http://localhost:8088
API:      http://localhost:8088/api/v1
Swagger:  http://localhost:8088/swagger-ui.html
OpenAPI:  http://localhost:8088/v3/api-docs
Health:   http://localhost:8088/actuator/health
MinIO:    http://localhost:9001
```

Dừng môi trường:

```bash
docker compose down
```

Chỉ xóa volume local khi chắc chắn không cần dữ liệu:

```bash
docker compose down -v
```

Compose mặc định dùng database/bucket `carx`. Có thể giữ tên cũ khi nâng cấp môi trường hiện hữu bằng cách đặt `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` và các biến MinIO trong `.env`.

Phiên đăng nhập dùng cookie `CARX_TOKEN` HttpOnly, `SameSite=Lax`; `APP_AUTH_COOKIE_SECURE=true` bắt buộc cookie chỉ chạy qua HTTPS.

Đăng nhập Google là tùy chọn; nếu dùng, đặt `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` và `GOOGLE_REDIRECT_URI` trong environment. Mặc định local dùng placeholder để backend không fail startup.

## Chạy riêng backend

Cần MySQL và MinIO đang chạy. Các biến tối thiểu:

```bash
export DB_URL='jdbc:mysql://localhost:3306/carx?useSSL=false&allowPublicKeyRetrieval=true'
export DB_USERNAME='carx'
export DB_PASSWORD='carx-local'
export JWT_SECRET="$(openssl rand -base64 32)"
export MINIO_ENDPOINT='http://localhost:9000'
export MINIO_ACCESS_KEY='carx'
export MINIO_SECRET_KEY='carx-local-secret'
export MINIO_BUCKET='carx'
mvn spring-boot:run
```

Flyway tự chạy các migration theo thứ tự. Không sửa migration đã triển khai; thay đổi schema hoặc seed mới phải tạo migration tiếp theo.

## API chính

```text
POST  /api/v1/auth/register
POST  /api/v1/auth/login
GET   /api/v1/vehicle-catalog
GET   /api/v1/vehicle-catalog/brands/{brandId}/models
GET   /api/v1/listings
GET   /api/v1/listings/{id}
GET   /api/v1/listings/recommendations
POST  /api/v1/listings
PATCH /api/v1/listings/{id}
GET   /api/v1/admin/vehicle-catalog
POST  /api/v1/admin/vehicle-catalog/{resource}
PUT   /api/v1/admin/users/{id}/roles
GET   /api/v1/admin/health
```

Catalog admin chỉ nhận các resource: `brands`, `models`, `origins`, `transmissions`, `fuels`, `colors`, `body-types`, `drivelines`.

## Database và seed

- V1-V21: schema marketplace/auth hiện có.
- V22-V24: catalog xe và `vehicle_specs`.
- V25-V27: permissions, role mapping và RBAC.
- V28: danh mục CarX; danh mục cũ được giữ lại để không phá khóa ngoại nhưng không còn hiển thị.
- V29-V30: đồng bộ kiểu năm sản xuất và số chỗ trong `vehicle_specs` với entity Java khi Hibernate validate schema.
- V31: thêm phiên bản token xác thực để thu hồi các JWT cũ khi logout hoặc đổi mật khẩu.

Seed catalog gồm các hãng phổ biến, mẫu xe, nhiên liệu, hộp số, xuất xứ, màu, kiểu dáng và dẫn động. Listing mới luôn phải có `vehicle_specs` hợp lệ.

## Kiểm tra

```bash
mvn -q test
cd frontend && npm ci && npm run build
```

Smoke test migration trên MySQL tạm thời:

```bash
for file in $(ls src/main/resources/db/migration/V*.sql | sort -V); do
  mysql carx_verify < "$file" || exit 1
done
```
