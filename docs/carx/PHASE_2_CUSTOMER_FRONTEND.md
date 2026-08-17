# CarX — Phase 2: Customer Frontend

## Phạm vi đã hoàn thành

- Kết nối customer site với `GET /api/v1/vehicle-catalog` và API model theo hãng.
- Form đăng tin và chỉnh sửa tin gửi đầy đủ `vehicle` object theo contract Phase 1.
- Bộ lọc tìm kiếm hỗ trợ hãng, dòng xe, năm, hộp số, nhiên liệu, xuất xứ, màu, kiểu dáng, số chỗ, dẫn động và kilomet.
- Card và trang chi tiết hiển thị thông số xe; trang chi tiết tải tên dòng xe theo hãng.
- Gợi ý xe dùng `GET /api/v1/listings/recommendations` theo xe đang xem hoặc bộ lọc gần nhất.
- Bộ lọc gần nhất chỉ lưu các giá trị tìm kiếm không nhạy cảm trong `localStorage`; không thay đổi cơ chế lưu token hiện có.
- Nội dung customer UI chính đã chuyển từ ngữ cảnh đồ điện tử sang CarX/ô tô.

## Tiêu chí nghiệm thu

- `npm run build` tại `frontend/` đạt.
- `mvn -q test` tại root đạt.
- Không thêm dependency mới.
- Các lựa chọn model bị khóa cho đến khi chọn hãng và chỉ tải model thuộc hãng đó.
- Khi không có lịch sử tìm kiếm hoặc gợi ý, giao diện không hiển thị khối rỗng.

## File chính

- `frontend/src/api.js`
- `frontend/src/App.jsx`
- `frontend/src/styles.css`
