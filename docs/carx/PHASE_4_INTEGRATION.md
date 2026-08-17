# CarX — Phase 4: Tích hợp dữ liệu và vận hành

## Phạm vi hoàn tất

- Seed danh mục CarX bằng migration `V28__seed_carx_categories.sql`.
- Giữ các category cũ để không phá foreign key; chỉ expose category ô tô mới.
- Đồng bộ các nhãn còn sót từ OldMarket sang CarX ở customer/admin UI.
- Chuẩn hóa session key mới `carx-session`, vẫn đọc được session key cũ trong một lần nâng cấp.
- Chuẩn hóa Docker Compose về database/bucket `carx`, có thể override qua `.env`.
- MinIO init idempotent, backend chờ MySQL/MinIO healthy, frontend chờ backend healthy.
- Bổ sung `.env.example` và README chạy local.

## Seed danh mục CarX

Danh mục public gồm:

`Sedan`, `SUV / CUV`, `Hatchback`, `MPV`, `Bán tải`, `Coupe`, `Mui trần`, `Xe điện`, `Xe sang`, `Khác`.

Các bảng catalog xe từ V24 và permissions từ V26-V27 vẫn là nguồn dữ liệu chuẩn; admin có thể cập nhật bằng giao diện Phase 3.

## Tiêu chí nghiệm thu

- [x] Database mới chạy tuần tự V1-V28.
- [x] Seed catalog xe và category CarX chạy được trên database trắng; V28 dùng upsert cho các bản ghi category.
- [x] Foreign key `listings.category_id` không bị phá bởi việc ẩn category cũ.
- [x] Compose config hợp lệ khi có `JWT_SECRET`.
- [x] Compose có health dependency cho backend/frontend.
- [x] UI không còn hiển thị thương hiệu OldMarket hoặc taxonomy điện tử.
- [x] Customer recommendations tiếp tục hoạt động không cần đăng nhập.

## Kiểm tra đã chạy

```text
mvn -q test                         PASS
npm run build                       PASS
docker compose config              PASS với JWT_SECRET tạm thời
Flyway V1-V28 trên MySQL tạm thời  PASS
```

Database thật chưa được thay đổi. Khi triển khai, đặt secret thật trong môi trường deploy, backup database trước migration và theo dõi `/actuator/health` sau khi backend healthy.
