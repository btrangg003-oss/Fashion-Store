# Requirements Document - Advanced Analytics Dashboard

## Introduction

Nâng cấp trang phân tích (Analytics) trong Admin Panel với 5 loại biểu đồ chuyên nghiệp, sử dụng thư viện Recharts để hiển thị dữ liệu một cách trực quan và khoa học. Hệ thống sẽ giúp admin theo dõi doanh thu, hiệu quả marketing, phân bố khách hàng, quản lý tồn kho và trạng thái đơn hàng.

## Glossary

- **Analytics Dashboard**: Trang phân tích dữ liệu trong Admin Panel
- **Recharts**: Thư viện biểu đồ React được xây dựng trên D3.js
- **Revenue**: Doanh thu từ các đơn hàng
- **Target**: Mục tiêu doanh thu đặt ra
- **Retention Rate**: Tỷ lệ khách hàng quay lại mua hàng
- **Marketing ROI**: Hiệu quả đầu tư marketing
- **Stock Level**: Mức tồn kho sản phẩm
- **Order Status**: Trạng thái đơn hàng (pending, processing, shipping, delivered, cancelled)

## Requirements

### Requirement 1: Biểu Đồ Doanh Thu Theo Thời Gian (Combo Chart)

**User Story:** Là một Admin, tôi muốn xem biểu đồ kết hợp giữa đường và cột để so sánh doanh thu thực tế với mục tiêu theo thời gian, để đánh giá hiệu suất kinh doanh.

#### Acceptance Criteria

1. THE Analytics Dashboard SHALL hiển thị biểu đồ kết hợp (ComposedChart) với đường biểu diễn doanh thu thực tế và cột biểu diễn mục tiêu doanh thu
2. WHEN Admin chọn khoảng thời gian (tuần/tháng/năm), THE System SHALL cập nhật dữ liệu biểu đồ theo khoảng thời gian đã chọn
3. THE Chart SHALL hiển thị tooltip khi hover vào điểm dữ liệu với thông tin chi tiết về doanh thu và mục tiêu
4. THE Chart SHALL sử dụng màu xanh lá (#10b981) cho doanh thu và màu xám (#9ca3af) cho mục tiêu
5. THE Chart SHALL hiển thị legend phân biệt giữa "Doanh thu" và "Mục tiêu"

### Requirement 2: Biểu Đồ Retention & Marketing ROI (Bar Chart)

**User Story:** Là một Admin, tôi muốn xem biểu đồ cột đánh giá tỷ lệ retention và hiệu quả marketing theo từng tháng, để tối ưu hóa chiến lược marketing.

#### Acceptance Criteria

1. THE Analytics Dashboard SHALL hiển thị biểu đồ cột (BarChart) với 2 metrics: Retention Rate và Marketing ROI
2. THE Chart SHALL hiển thị dữ liệu theo tháng trong 6 tháng gần nhất
3. THE Retention Rate SHALL được tính bằng công thức: (Số khách hàng quay lại / Tổng số khách hàng) * 100
4. THE Marketing ROI SHALL được tính bằng công thức: ((Doanh thu - Chi phí marketing) / Chi phí marketing) * 100
5. THE Chart SHALL sử dụng màu tím (#8b5cf6) cho Retention Rate và màu cam (#f59e0b) cho Marketing ROI

### Requirement 3: Biểu Đồ Phân Bố Khách Hàng (Pie Charts)

**User Story:** Là một Admin, tôi muốn xem biểu đồ tròn phân bố khách hàng theo độ tuổi và giới tính, để hiểu rõ đối tượng khách hàng mục tiêu.

#### Acceptance Criteria

1. THE Analytics Dashboard SHALL hiển thị 2 biểu đồ tròn (PieChart) cạnh nhau: một cho độ tuổi và một cho giới tính
2. THE Age Distribution Chart SHALL phân loại khách hàng thành 5 nhóm: 18-24, 25-34, 35-44, 45-54, 55+
3. THE Gender Distribution Chart SHALL phân loại khách hàng thành: Nam, Nữ, Khác
4. THE Charts SHALL hiển thị phần trăm và số lượng khách hàng trong mỗi phân khúc
5. THE Charts SHALL sử dụng bảng màu gradient từ xanh dương đến tím (#3b82f6 → #8b5cf6)

### Requirement 4: Biểu Đồ Quản Lý Sản Phẩm & Tồn Kho (Pie Chart)

**User Story:** Là một Admin, tôi muốn xem biểu đồ tròn phân loại sản phẩm theo mức độ bán chạy và tồn kho, để quản lý inventory hiệu quả.

#### Acceptance Criteria

1. THE Analytics Dashboard SHALL hiển thị biểu đồ tròn (PieChart) phân loại sản phẩm thành 4 nhóm: Hot (bán chạy), Normal (bình thường), Slow (ế), Out of Stock (hết hàng)
2. THE Hot Products SHALL được định nghĩa là sản phẩm có số lượng bán > 50 trong tháng
3. THE Slow Products SHALL được định nghĩa là sản phẩm có số lượng bán < 10 trong tháng
4. THE Chart SHALL hiển thị số lượng sản phẩm và phần trăm trong mỗi nhóm
5. THE Chart SHALL sử dụng màu: Xanh lá (#10b981) cho Hot, Xanh dương (#3b82f6) cho Normal, Cam (#f59e0b) cho Slow, Đỏ (#ef4444) cho Out of Stock

### Requirement 5: Biểu Đồ Đơn Hàng & Trạng Thái (Stacked Bar Chart)

**User Story:** Là một Admin, tôi muốn xem biểu đồ cột kết hợp thể hiện số lượng đơn hàng theo thời gian và tỷ lệ trạng thái đơn hàng, để theo dõi quy trình xử lý đơn hàng.

#### Acceptance Criteria

1. THE Analytics Dashboard SHALL hiển thị biểu đồ cột xếp chồng (StackedBarChart) với các trạng thái đơn hàng
2. THE Chart SHALL hiển thị 5 trạng thái: Pending, Processing, Shipping, Delivered, Cancelled
3. WHEN Admin hover vào cột, THE System SHALL hiển thị tooltip với số lượng và phần trăm của từng trạng thái
4. THE Chart SHALL hiển thị dữ liệu theo tuần trong 8 tuần gần nhất
5. THE Chart SHALL sử dụng màu: Xám (#6b7280) cho Pending, Cam (#f59e0b) cho Processing, Xanh dương (#3b82f6) cho Shipping, Xanh lá (#10b981) cho Delivered, Đỏ (#ef4444) cho Cancelled

### Requirement 6: Layout & Responsive Design

**User Story:** Là một Admin, tôi muốn các biểu đồ được sắp xếp khoa học và responsive trên mọi thiết bị, để dễ dàng xem và phân tích dữ liệu.

#### Acceptance Criteria

1. THE Analytics Dashboard SHALL sắp xếp biểu đồ theo grid layout 2 cột trên desktop
2. THE Layout SHALL tự động chuyển sang 1 cột trên mobile (< 768px)
3. THE Charts SHALL có chiều cao tối thiểu 300px và tối đa 400px
4. THE Dashboard SHALL hiển thị loading state khi đang tải dữ liệu
5. THE Dashboard SHALL hiển thị empty state khi không có dữ liệu

### Requirement 7: Filters & Time Range Selection

**User Story:** Là một Admin, tôi muốn lọc dữ liệu theo khoảng thời gian khác nhau, để phân tích xu hướng trong các giai đoạn khác nhau.

#### Acceptance Criteria

1. THE Analytics Dashboard SHALL cung cấp dropdown để chọn khoảng thời gian: Tuần này, Tháng này, Quý này, Năm này, Tùy chỉnh
2. WHEN Admin chọn "Tùy chỉnh", THE System SHALL hiển thị date picker để chọn ngày bắt đầu và kết thúc
3. WHEN Admin thay đổi khoảng thời gian, THE System SHALL cập nhật tất cả biểu đồ với dữ liệu mới
4. THE System SHALL lưu lựa chọn khoảng thời gian vào localStorage
5. THE System SHALL hiển thị loading indicator khi đang tải dữ liệu mới

### Requirement 8: Export & Print Functionality

**User Story:** Là một Admin, tôi muốn xuất báo cáo analytics ra file PDF hoặc Excel, để chia sẻ với team hoặc lưu trữ.

#### Acceptance Criteria

1. THE Analytics Dashboard SHALL cung cấp nút "Xuất PDF" và "Xuất Excel"
2. WHEN Admin click "Xuất PDF", THE System SHALL tạo file PDF chứa tất cả biểu đồ và số liệu
3. WHEN Admin click "Xuất Excel", THE System SHALL tạo file Excel chứa dữ liệu raw của tất cả biểu đồ
4. THE Exported files SHALL bao gồm thông tin: Tiêu đề, Khoảng thời gian, Ngày xuất
5. THE System SHALL hiển thị thông báo thành công sau khi xuất file

### Requirement 9: Real-time Data Updates

**User Story:** Là một Admin, tôi muốn dữ liệu analytics được cập nhật tự động, để luôn xem thông tin mới nhất.

#### Acceptance Criteria

1. THE Analytics Dashboard SHALL tự động refresh dữ liệu mỗi 5 phút
2. THE System SHALL hiển thị timestamp của lần cập nhật cuối cùng
3. THE Dashboard SHALL cung cấp nút "Làm mới" để admin có thể refresh thủ công
4. WHEN dữ liệu đang được cập nhật, THE System SHALL hiển thị loading indicator nhỏ
5. THE System SHALL không làm gián đoạn trải nghiệm người dùng khi refresh dữ liệu

### Requirement 10: Performance & Optimization

**User Story:** Là một Admin, tôi muốn trang analytics load nhanh và mượt mà, để không phải chờ đợi lâu khi xem dữ liệu.

#### Acceptance Criteria

1. THE Analytics Dashboard SHALL load và hiển thị trong vòng 2 giây với dữ liệu cache
2. THE System SHALL sử dụng lazy loading cho các biểu đồ phức tạp
3. THE Charts SHALL sử dụng animation mượt mà khi render (duration < 500ms)
4. THE System SHALL cache dữ liệu analytics trong 5 phút
5. THE Dashboard SHALL sử dụng React.memo và useMemo để tối ưu re-render
