# Bình Mỹ FarmGo - bản hoàn thiện QR + bản đồ

Các chỉnh sửa chính trong bản này:

- VietQR dùng Agribank BIN `970405`, STK `5101205184196`, chủ TK `LE HUU HUY`.
- QR dùng template `qr_only`, số tiền lấy theo tổng đơn demo (`amount`).
- Nội dung chuyển khoản dùng mã đơn đã loại dấu/ký tự đặc biệt, ví dụ `BMFG-261002-ABC123` -> `BMFG261002ABC123`.
- Không fallback sang ảnh QR tĩnh. Nếu ảnh VietQR lỗi, giao diện báo không tải được QR.
- Hiển thị rõ số tiền cần chuyển và nội dung chuyển khoản bên dưới QR.
- Rau móp dùng ảnh mới trong `src/assets/san-pham-rau-mop-moi.png`.
- `/ban-do` có Leaflet + OpenStreetMap, bộ lọc và 4 địa điểm minh họa khi chưa có dữ liệu thật.
- Khi Supabase đặt hàng lỗi/chưa kết nối, prototype tự tạo đơn demo trên trình duyệt để vẫn trình diễn QR động.
