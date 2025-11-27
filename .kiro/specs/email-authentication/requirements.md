# Requirements Document - Email Authentication System

## Introduction

Hệ thống xác thực email cho Fashion Store website, bao gồm đăng ký tài khoản với xác thực email, đăng nhập với kiểm tra thông tin từ server, và quản lý phiên đăng nhập người dùng.

## Requirements

### Requirement 1: User Registration with Email Verification

**User Story:** Là một khách hàng mới, tôi muốn đăng ký tài khoản với email để có thể mua sắm và theo dõi đơn hàng của mình.

#### Acceptance Criteria

1. WHEN người dùng điền form đăng ký với thông tin hợp lệ THEN hệ thống SHALL lưu thông tin tạm thời và gửi mã xác thực 4 chữ số về email
2. WHEN email đã tồn tại trong hệ thống THEN hệ thống SHALL hiển thị thông báo "Email đã được sử dụng"
3. WHEN thông tin đăng ký không hợp lệ THEN hệ thống SHALL hiển thị lỗi validation tương ứng
4. WHEN gửi email thành công THEN hệ thống SHALL chuyển hướng đến trang nhập mã xác thực
5. WHEN gửi email thất bại THEN hệ thống SHALL hiển thị thông báo lỗi và cho phép thử lại

### Requirement 2: Email Verification Code

**User Story:** Là một người dùng vừa đăng ký, tôi muốn nhập mã xác thực từ email để hoàn tất việc tạo tài khoản.

#### Acceptance Criteria

1. WHEN người dùng nhập mã xác thực đúng THEN hệ thống SHALL tạo tài khoản chính thức và chuyển hướng đến trang đăng nhập
2. WHEN người dùng nhập mã xác thực sai THEN hệ thống SHALL hiển thị thông báo "Mã xác thực không đúng"
3. WHEN mã xác thực hết hạn (10 phút) THEN hệ thống SHALL hiển thị thông báo hết hạn và cho phép gửi lại mã mới
4. WHEN người dùng yêu cầu gửi lại mã THEN hệ thống SHALL tạo mã mới và gửi về email
5. WHEN người dùng nhập sai mã quá 3 lần THEN hệ thống SHALL khóa tạm thời và yêu cầu gửi lại mã mới

### Requirement 3: User Login Authentication

**User Story:** Là một khách hàng đã có tài khoản, tôi muốn đăng nhập bằng email và mật khẩu để truy cập tài khoản của mình.

#### Acceptance Criteria

1. WHEN người dùng nhập email và mật khẩu đúng THEN hệ thống SHALL đăng nhập thành công và chuyển hướng đến trang profile
2. WHEN email không tồn tại trong hệ thống THEN hệ thống SHALL hiển thị "Tài khoản không tồn tại. Vui lòng đăng ký."
3. WHEN mật khẩu sai THEN hệ thống SHALL hiển thị "Mật khẩu không đúng"
4. WHEN tài khoản chưa được xác thực email THEN hệ thống SHALL hiển thị thông báo và cho phép gửi lại mã xác thực
5. WHEN đăng nhập thành công THEN hệ thống SHALL tạo session/token và lưu trạng thái đăng nhập

### Requirement 4: User Data Storage

**User Story:** Là hệ thống, tôi cần lưu trữ thông tin người dùng một cách an toàn để quản lý tài khoản và xác thực.

#### Acceptance Criteria

1. WHEN lưu mật khẩu THEN hệ thống SHALL mã hóa mật khẩu bằng bcrypt hoặc tương tự
2. WHEN lưu thông tin người dùng THEN hệ thống SHALL lưu vào database/file JSON với cấu trúc rõ ràng
3. WHEN tạo mã xác thực THEN hệ thống SHALL lưu mã kèm thời gian hết hạn
4. WHEN xác thực thành công THEN hệ thống SHALL cập nhật trạng thái tài khoản thành "verified"
5. WHEN truy vấn người dùng THEN hệ thống SHALL không trả về mật khẩu trong response

### Requirement 5: Email Service Integration

**User Story:** Là hệ thống, tôi cần gửi email xác thực đến người dùng một cách đáng tin cậy.

#### Acceptance Criteria

1. WHEN gửi email xác thực THEN hệ thống SHALL sử dụng template email chuyên nghiệp
2. WHEN tạo mã xác thực THEN hệ thống SHALL tạo mã 4 chữ số ngẫu nhiên
3. WHEN gửi email THEN hệ thống SHALL include thông tin: mã xác thực, thời gian hết hạn, hướng dẫn
4. WHEN email service lỗi THEN hệ thống SHALL log lỗi và thông báo cho người dùng
5. WHEN cấu hình email THEN hệ thống SHALL sử dụng environment variables cho thông tin nhạy cảm

### Requirement 6: Session Management

**User Story:** Là một người dùng đã đăng nhập, tôi muốn duy trì trạng thái đăng nhập khi duyệt website và có thể đăng xuất khi cần.

#### Acceptance Criteria

1. WHEN đăng nhập thành công THEN hệ thống SHALL tạo JWT token hoặc session
2. WHEN truy cập trang yêu cầu đăng nhập THEN hệ thống SHALL kiểm tra token/session hợp lệ
3. WHEN token hết hạn THEN hệ thống SHALL yêu cầu đăng nhập lại
4. WHEN người dùng đăng xuất THEN hệ thống SHALL xóa token/session
5. WHEN refresh trang THEN hệ thống SHALL duy trì trạng thái đăng nhập nếu token còn hợp lệ

### Requirement 7: Security & Validation

**User Story:** Là hệ thống, tôi cần đảm bảo bảo mật thông tin người dùng và ngăn chặn các cuộc tấn công.

#### Acceptance Criteria

1. WHEN validate email THEN hệ thống SHALL kiểm tra format email hợp lệ
2. WHEN validate mật khẩu THEN hệ thống SHALL yêu cầu tối thiểu 6 ký tự
3. WHEN có nhiều lần thử đăng nhập sai THEN hệ thống SHALL implement rate limiting
4. WHEN lưu trữ dữ liệu THEN hệ thống SHALL sanitize input để tránh injection
5. WHEN xử lý API THEN hệ thống SHALL validate tất cả input từ client

### Requirement 8: User Experience

**User Story:** Là người dùng, tôi muốn có trải nghiệm mượt mà và rõ ràng trong quá trình đăng ký và đăng nhập.

#### Acceptance Criteria

1. WHEN đang xử lý request THEN hệ thống SHALL hiển thị loading state
2. WHEN có lỗi xảy ra THEN hệ thống SHALL hiển thị thông báo lỗi rõ ràng
3. WHEN thành công THEN hệ thống SHALL hiển thị thông báo thành công và chuyển hướng
4. WHEN nhập form THEN hệ thống SHALL validate real-time và hiển thị lỗi ngay lập tức
5. WHEN trên mobile THEN hệ thống SHALL responsive và dễ sử dụng