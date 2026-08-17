# CarX — Phase 6: Release readiness

## Kết luận

CarX đạt release readiness cho local/staging Compose sau khi sửa mẫu `JWT_SECRET` thành Base64 hợp lệ và bổ sung health-check cho frontend.

Production vẫn phải thay toàn bộ credential mặc định, dùng secret manager và bật HTTPS.

## Compose E2E

Lệnh đã chạy:

```bash
cp .env.example .env
openssl rand -base64 32
docker compose up --build -d
docker compose ps
```

Kết quả service:

| Service | Kết quả |
|---|---|
| MySQL | healthy |
| MinIO | running; bucket `carx` được tạo bởi `minio-init` |
| Backend | healthy |
| Frontend | healthy, port `8088` |

Smoke test qua frontend proxy:

| Luồng | HTTP/kết quả |
|---|---|
| Trang CarX | 200; nhận diện thương hiệu CarX |
| Actuator health | 200; `status=UP` |
| Storage health | 204 |
| Vehicle catalog | 200 |
| Public listings | 200 |
| Register | 201 |
| Cookie phiên | `CARX_TOKEN`, HttpOnly, SameSite=Lax |
| User `/me` và `/listings/mine` | 200 |
| User gọi admin health | 403 |

## Verification gate

| Gate | Kết quả |
|---|---|
| `mvn -q clean verify` | PASS; 22 tests, 0 failure/error |
| `npm ci --ignore-scripts` | PASS |
| `npm run build` | PASS |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| Flyway V1–V30 trên MySQL Compose | PASS |
| Compose dependency và health-check | PASS |

## Bàn giao vận hành

- Local HTTP: giữ `APP_AUTH_COOKIE_SECURE=false`.
- HTTPS/staging/production: đặt `APP_AUTH_COOKIE_SECURE=true`.
- Thay `JWT_SECRET`, mật khẩu MySQL và MinIO mặc định trước khi triển khai.
- Không commit file `.env` hoặc credential thật.
- Dừng môi trường bằng `docker compose down`; chỉ dùng `docker compose down -v` khi chấp nhận xóa dữ liệu local.
