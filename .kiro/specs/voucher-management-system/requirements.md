# Requirements Document - Voucher Management System

## Introduction

Xây dựng hệ thống quản lý mã giảm giá (Voucher/Coupon) hoàn chỉnh cho Admin, bao gồm tạo, sửa, xóa, thống kê, tự động hóa và phân quyền. Hệ thống hỗ trợ nhiều loại voucher, điều kiện áp dụng phức tạp, và tích hợp với toàn bộ flow mua hàng.

## Glossary

- **Voucher/Coupon**: Mã giảm giá
- **Discount Type**: Loại giảm giá (%, fixed amount, freeship)
- **Usage Limit**: Giới hạn số lần sử dụng
- **Validity Period**: Thời gian hiệu lực
- **Target Audience**: Đối tượng áp dụng
- **Stacking**: Chồng mã (dùng nhiều mã cùng lúc)
- **Auto-apply**: Tự động áp dụng mã tốt nhất

## Requirements

### Requirement 1: Danh Sách Mã Giảm Giá

**User Story:** Là Admin, tôi muốn xem danh sách tất cả voucher với đầy đủ thông tin, để quản lý và theo dõi hiệu quả.

#### Acceptance Criteria

1. THE System SHALL hiển thị bảng voucher với các cột:
   - Mã voucher (code)
   - Loại giảm giá (percentage/fixed/freeship)
   - Giá trị giảm
   - Thời gian áp dụng (start date → end date)
   - Trạng thái (Active/Expired/Paused/Upcoming)
   - Giới hạn sử dụng (total/remaining)
   - Loại người dùng (all/new/vip/specific)
   - Người tạo/chỉnh sửa
   - Ngày tạo/cập nhật

2. THE System SHALL hỗ trợ phân trang với 10/25/50/100 items per page

3. THE System SHALL hiển thị badge màu sắc cho trạng thái:
   - Active: Green
   - Expired: Red
   - Paused: Gray
   - Upcoming: Blue

4. WHEN Admin click vào voucher, THE System SHALL mở trang chi tiết

5. THE System SHALL hiển thị quick actions: Edit, Pause/Resume, Delete

### Requirement 2: Bộ Lọc & Tìm Kiếm

**User Story:** Là Admin, tôi muốn tìm kiếm và lọc voucher nhanh chóng, để dễ dàng quản lý khi có nhiều voucher.

#### Acceptance Criteria

1. THE System SHALL cung cấp search box tìm theo:
   - Mã voucher
   - Mô tả
   - Người tạo

2. THE System SHALL cung cấp filters:
   - Loại voucher (percentage/fixed/freeship)
   - Trạng thái (active/expired/paused/upcoming)
   - Ngày tạo (date range)
   - Ngày hết hạn (date range)
   - Loại người dùng

3. THE System SHALL hỗ trợ sắp xếp theo:
   - Lượt sử dụng (cao → thấp)
   - Giá trị giảm (cao → thấp)
   - Ngày hết hạn (gần nhất)
   - Ngày tạo (mới nhất)

4. THE System SHALL lưu filter preferences vào localStorage

5. THE System SHALL hiển thị số lượng kết quả tìm được

### Requirement 3: Tạo Mới Mã Giảm Giá

**User Story:** Là Admin, tôi muốn tạo voucher mới với đầy đủ cấu hình, để phục vụ các chiến dịch marketing.

#### Acceptance Criteria

1. THE System SHALL cung cấp form tạo voucher với các trường:
   - **Mã voucher**: Text input hoặc button "Tạo ngẫu nhiên"
   - **Mô tả**: Textarea cho ghi chú nội bộ
   - **Loại giảm giá**: Radio buttons (percentage/fixed/freeship)
   - **Giá trị giảm**: Number input

2. THE System SHALL validate:
   - Mã voucher unique (không trùng)
   - Mã voucher format (uppercase, no spaces, 6-20 chars)
   - Giá trị giảm > 0
   - Percentage ≤ 100%

3. THE System SHALL cho phép chọn phạm vi áp dụng:
   - Toàn bộ sản phẩm
   - Danh mục cụ thể (multi-select)
   - Sản phẩm cụ thể (search & select)
   - Người dùng cụ thể (by ID or group)

4. THE System SHALL cho phép cấu hình điều kiện:
   - Giá trị đơn tối thiểu
   - Không chồng mã khác (checkbox)
   - Số lần sử dụng tối đa (total system-wide)
   - Số lần mỗi user (per user limit)
   - Không áp dụng với sản phẩm đang sale

5. THE System SHALL cho phép chọn thời gian:
   - Start date & time
   - End date & time
   - Recurring option (weekly/monthly)

6. THE System SHALL cho phép cấu hình hiển thị:
   - Active/Inactive toggle
   - Public visibility (show on user interface)
   - Event label (BLACK FRIDAY, 11.11, etc.)

### Requirement 4: Chỉnh Sửa Mã Giảm Giá

**User Story:** Là Admin, tôi muốn chỉnh sửa voucher và xem lịch sử thay đổi, để điều chỉnh chiến dịch và audit trail.

#### Acceptance Criteria

1. THE System SHALL cho phép edit tất cả thông tin voucher

2. THE System SHALL ghi lại lịch sử chỉnh sửa:
   - User ID người chỉnh sửa
   - Timestamp
   - Fields changed (before → after)
   - Reason (optional note)

3. THE System SHALL hiển thị history log trong voucher detail page

4. THE System SHALL cho phép khôi phục version cũ (rollback)

5. THE System SHALL prevent edit voucher đã expired (chỉ cho xem)

### Requirement 5: Xóa / Tạm Dừng / Khôi Phục

**User Story:** Là Admin, tôi muốn quản lý lifecycle của voucher, để kiểm soát khi nào voucher có thể sử dụng.

#### Acceptance Criteria

1. THE System SHALL cung cấp 3 actions:
   - **Pause**: Tạm dừng (không thể dùng, giữ data)
   - **Resume**: Khôi phục voucher bị pause
   - **Delete**: Xóa vĩnh viễn

2. WHEN Admin click Delete, THE System SHALL hiển thị confirmation modal

3. THE System SHALL hỗ trợ bulk actions:
   - Select multiple vouchers
   - Pause/Resume/Delete hàng loạt

4. THE System SHALL soft delete (move to trash) trước khi hard delete

5. THE System SHALL log all delete actions với user ID và timestamp

### Requirement 6: Thống Kê & Báo Cáo

**User Story:** Là Admin, tôi muốn xem thống kê chi tiết về voucher, để đánh giá hiệu quả chiến dịch.

#### Acceptance Criteria

1. THE System SHALL hiển thị overview stats:
   - Tổng số voucher (total/active/expired)
   - Tổng lượt sử dụng
   - Doanh thu có voucher
   - Tỷ lệ conversion với voucher

2. THE System SHALL hiển thị top vouchers:
   - Top 10 được dùng nhiều nhất
   - Top 10 mang lại doanh thu cao nhất
   - Top 10 có conversion rate cao nhất

3. THE System SHALL hiển thị biểu đồ:
   - Usage over time (line chart)
   - Revenue with voucher (bar chart)
   - Voucher by type (pie chart)

4. THE System SHALL cho phép export báo cáo:
   - Excel format với multiple sheets
   - PDF format với charts
   - Date range selection

5. THE System SHALL cache statistics (5 minutes TTL)

### Requirement 7: Phân Quyền Người Dùng

**User Story:** Là System Admin, tôi muốn phân quyền cho các role khác nhau, để kiểm soát ai có thể làm gì.

#### Acceptance Criteria

1. THE System SHALL định nghĩa 3 roles:
   - **Super Admin**: Full access (create/edit/delete)
   - **Marketing**: Create & edit only
   - **Support**: View only

2. THE System SHALL check permissions trước khi cho phép action

3. THE System SHALL log tất cả actions với user ID

4. THE System SHALL hiển thị audit log:
   - Who did what
   - When
   - What changed

5. THE System SHALL restrict API endpoints theo role

### Requirement 8: Tự Động Hóa

**User Story:** Là Admin, tôi muốn hệ thống tự động xử lý voucher, để giảm công việc thủ công.

#### Acceptance Criteria

1. THE System SHALL tự động update status:
   - Upcoming → Active khi đến start date
   - Active → Expired khi đến end date
   - Active → Used Up khi hết lượt

2. THE System SHALL tự động gửi notifications:
   - Email cho users khi có voucher mới
   - Reminder khi voucher sắp hết hạn (3 days before)
   - Alert admin khi voucher sắp hết lượt

3. THE System SHALL hỗ trợ personalized vouchers:
   - Auto-create cho user mới (welcome voucher)
   - Birthday voucher (auto-send on birthday)
   - Win-back voucher (inactive 30 days)

4. THE System SHALL tự động chọn best voucher:
   - Khi user có nhiều vouchers
   - Tính toán voucher nào tiết kiệm nhất
   - Auto-apply at checkout

5. THE System SHALL run cron jobs:
   - Every hour: Check & update status
   - Daily: Send expiry reminders
   - Weekly: Generate usage reports

### Requirement 9: Tích Hợp Checkout

**User Story:** Là User, tôi muốn áp dụng voucher khi checkout, để được giảm giá.

#### Acceptance Criteria

1. THE Checkout page SHALL có input field "Nhập mã giảm giá"

2. WHEN User nhập mã, THE System SHALL validate:
   - Voucher exists & active
   - User eligible (target audience match)
   - Order meets minimum value
   - Usage limit not exceeded
   - Not expired

3. THE System SHALL hiển thị discount amount sau khi apply

4. THE System SHALL cho phép remove voucher

5. THE System SHALL prevent stacking nếu voucher có flag "no_stacking"

6. THE System SHALL suggest best voucher nếu user có nhiều vouchers

### Requirement 10: User Voucher Management

**User Story:** Là User, tôi muốn xem vouchers của mình, để biết mã nào có thể dùng.

#### Acceptance Criteria

1. THE Profile page SHALL có tab "Ưu đãi & Mã giảm giá"

2. THE System SHALL hiển thị vouchers:
   - Available (chưa dùng, còn hạn)
   - Used (đã dùng)
   - Expired (hết hạn)

3. THE System SHALL hiển thị voucher card với:
   - Code
   - Discount value
   - Expiry date
   - Conditions
   - "Copy code" button

4. THE System SHALL cho phép claim public vouchers

5. THE System SHALL notify user khi có voucher mới
