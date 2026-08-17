# CarX — Phase 5: Kiểm thử và hardening

## Phạm vi hoàn tất

- Cookie phiên đổi sang `CARX_TOKEN`, HttpOnly và `SameSite=Lax`; cờ `Secure` bật bằng `APP_AUTH_COOKIE_SECURE`.
- Frontend không còn lưu JWT trong `localStorage`; request dùng cookie same-origin.
- Staff chỉ nhìn thấy các tab admin tương ứng với permission được cấp.
- Payload cập nhật tin không chấp nhận tiêu đề, mô tả hoặc địa chỉ chỉ gồm khoảng trắng.
- Giữ rate limit cho auth và bổ sung test hồi quy cho ngưỡng 5 request/phút/IP/route.
- Sửa và kiểm thử cấu hình bucket MinIO trong `application.yml`.
- Thêm migration forward-only `V29-V30` để đồng bộ kiểu năm sản xuất và số chỗ với Hibernate/JPA.
- OAuth Google chưa cấu hình không còn làm backend fail startup; credential thật vẫn lấy từ environment.

## Ma trận kiểm thử

| Nhóm | Kết quả |
|---|---|
| Backend unit/controller tests | PASS |
| Frontend production build | PASS |
| Frontend clean `npm ci` + audit | PASS, 0 vulnerabilities |
| Maven package | PASS |
| Compose config + health dependencies | PASS |
| YAML MinIO property smoke test | PASS |
| Auth cookie contract test | PASS |
| Rate-limit regression test | PASS |
| Update listing validation test | PASS |
| Backend startup với Flyway V1–V30 + MySQL tạm | PASS sau V29-V30 |

## Kiểm tra môi trường

Compose runtime và black-box E2E đã được hoàn tất ở Phase 6; xem báo cáo tại `PHASE_6_RELEASE_READINESS.md`.

Không lưu secret thật trong repository. Khi deploy HTTPS, đặt `JWT_SECRET` và `APP_AUTH_COOKIE_SECURE=true` trong secret manager hoặc environment của môi trường chạy.
