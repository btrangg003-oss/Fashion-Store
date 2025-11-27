# Requirements Document - Phiếu Xuất Kho Cơ Bản

## Introduction

Hệ thống Phiếu Xuất Kho (Outbound Management) cho phép quản lý việc xuất hàng ra khỏi kho một cách chuyên nghiệp, với kiểm soát tồn kho realtime, tích hợp đơn hàng, và tính toán chi phí đầy đủ. Hệ thống kế thừa và mở rộng từ Phiếu Nhập Kho hiện có.

## Glossary

- **Outbound System**: Hệ thống quản lý phiếu xuất kho
- **Stock Movement**: Phiếu xuất nhập kho
- **Inventory Item**: Sản phẩm trong kho
- **Available Stock**: Số lượng tồn kho khả dụng
- **Reserved Stock**: Số lượng đã đặt trước
- **Order Integration**: Tích hợp với đơn hàng
- **Cost Calculation**: Tính toán chi phí xuất kho
- **Stock Validation**: Kiểm tra tồn kho trước khi xuất

---

## Requirements

### Requirement 1: Tạo Phiếu Xuất Kho

**User Story:** As a warehouse staff, I want to create outbound receipts with auto-generated receipt numbers, so that I can track all outbound movements systematically.

#### Acceptance Criteria

1. WHEN the warehouse staff opens the outbound form, THE Outbound System SHALL generate a unique receipt number with format "OUT-YYYYMMDD-XXX"
2. WHEN the warehouse staff selects a receipt date, THE Outbound System SHALL accept and store the selected date
3. THE Outbound System SHALL display the current logged-in user as the creator
4. WHEN the warehouse staff selects an outbound type, THE Outbound System SHALL provide options: "sale", "online_order", "return_to_supplier", "damaged"
5. THE Outbound System SHALL allow the warehouse staff to enter notes with maximum 1000 characters

---

### Requirement 2: Tìm Kiếm và Thêm Sản Phẩm

**User Story:** As a warehouse staff, I want to search and add products with autocomplete functionality, so that I can quickly build the outbound list.

#### Acceptance Criteria

1. WHEN the warehouse staff types in the product search field, THE Outbound System SHALL display matching products based on SKU or name
2. WHEN the warehouse staff selects a product from search results, THE Outbound System SHALL add the product to the outbound items list
3. THE Outbound System SHALL display the current available stock quantity for each product
4. WHEN a product already exists in the items list, THE Outbound System SHALL display an error message "Sản phẩm đã có trong danh sách"
5. THE Outbound System SHALL provide a button to navigate to the add new product page

---

### Requirement 3: Kiểm Tra Tồn Kho Realtime

**User Story:** As a warehouse staff, I want to see realtime stock availability when adding products, so that I can ensure sufficient stock before creating the outbound receipt.

#### Acceptance Criteria

1. WHEN the warehouse staff adds a product to the outbound list, THE Outbound System SHALL display the current available stock quantity
2. WHEN the requested quantity exceeds available stock, THE Outbound System SHALL display a warning with red color indicator
3. WHEN the requested quantity is within available stock, THE Outbound System SHALL display a success indicator with green color
4. WHEN the available stock is low (less than 10), THE Outbound System SHALL display a warning with yellow color indicator
5. THE Outbound System SHALL prevent submission if any product has insufficient stock and status is not "draft"

---

### Requirement 4: Quản Lý Danh Sách Sản Phẩm

**User Story:** As a warehouse staff, I want to manage the product list with inline editing capabilities, so that I can adjust quantities and prices efficiently.

#### Acceptance Criteria

1. THE Outbound System SHALL display a table with columns: STT, SKU, Product Name, Available Stock, Requested Quantity, Cost Price, Total Value, Actions
2. WHEN the warehouse staff changes the quantity, THE Outbound System SHALL recalculate the total value automatically
3. WHEN the warehouse staff changes the cost price, THE Outbound System SHALL recalculate the total value automatically
4. THE Outbound System SHALL calculate total value as: quantity × cost price
5. WHEN the warehouse staff clicks the remove button, THE Outbound System SHALL remove the product from the list

---

### Requirement 5: Tính Toán Chi Phí

**User Story:** As a warehouse manager, I want to see detailed cost calculations including VAT and discounts, so that I can understand the total outbound value.

#### Acceptance Criteria

1. THE Outbound System SHALL calculate subtotal as the sum of all item total values
2. WHEN the warehouse staff selects a VAT rate (0%, 5%, 8%, 10%), THE Outbound System SHALL calculate VAT amount as: subtotal × VAT rate
3. WHEN the warehouse staff enters a discount value, THE Outbound System SHALL support both percentage and fixed amount discount types
4. WHEN discount type is percentage, THE Outbound System SHALL calculate discount amount as: subtotal × discount percentage
5. WHEN discount type is fixed, THE Outbound System SHALL use the entered amount as discount
6. THE Outbound System SHALL calculate final total as: subtotal + VAT amount - discount amount

---

### Requirement 6: Tích Hợp Đơn Hàng

**User Story:** As a warehouse staff, I want to link outbound receipts to customer orders, so that I can track which orders have been fulfilled.

#### Acceptance Criteria

1. THE Outbound System SHALL provide an optional field to enter order ID
2. WHEN an order ID is entered, THE Outbound System SHALL store the order reference
3. THE Outbound System SHALL allow entering customer name with maximum 200 characters
4. THE Outbound System SHALL allow entering customer phone with format validation
5. THE Outbound System SHALL allow entering shipping address with maximum 500 characters

---

### Requirement 7: Quản Lý Trạng Thái

**User Story:** As a warehouse manager, I want to control outbound receipt status through a workflow, so that I can ensure proper approval before stock is deducted.

#### Acceptance Criteria

1. THE Outbound System SHALL support four status values: "draft", "pending", "approved", "completed"
2. WHEN status is "draft", THE Outbound System SHALL NOT deduct stock quantities
3. WHEN status is "pending", THE Outbound System SHALL NOT deduct stock quantities
4. WHEN status is "approved", THE Outbound System SHALL deduct stock quantities from inventory
5. WHEN status is "completed", THE Outbound System SHALL deduct stock quantities from inventory
6. THE Outbound System SHALL display status with appropriate color coding and icons

---

### Requirement 8: Cập Nhật Tồn Kho

**User Story:** As an inventory manager, I want stock quantities to be automatically updated when outbound receipts are approved, so that inventory records remain accurate.

#### Acceptance Criteria

1. WHEN an outbound receipt status changes to "approved", THE Outbound System SHALL deduct the requested quantities from inventory
2. WHEN an outbound receipt status changes to "completed", THE Outbound System SHALL deduct the requested quantities from inventory
3. THE Outbound System SHALL update each product's stock status based on remaining quantity
4. WHEN remaining quantity is zero, THE Outbound System SHALL set status to "out_of_stock"
5. WHEN remaining quantity is less than or equal to minimum quantity, THE Outbound System SHALL set status to "low_stock"
6. WHEN remaining quantity is greater than minimum quantity, THE Outbound System SHALL set status to "in_stock"

---

### Requirement 9: Lịch Sử Thay Đổi

**User Story:** As an inventory manager, I want to track all changes made to outbound receipts, so that I can audit and review historical actions.

#### Acceptance Criteria

1. WHEN an outbound receipt is created, THE Outbound System SHALL record a history entry with action "Tạo phiếu"
2. WHEN an outbound receipt status changes, THE Outbound System SHALL record a history entry with the status change action
3. THE Outbound System SHALL store the user ID and name who performed each action
4. THE Outbound System SHALL store the timestamp for each action
5. THE Outbound System SHALL allow adding optional notes to history entries

---

### Requirement 10: Phương Thức Thanh Toán

**User Story:** As a warehouse staff, I want to record payment information for outbound receipts, so that I can track payment status.

#### Acceptance Criteria

1. THE Outbound System SHALL support multiple payment methods: "cash", "transfer", "debt"
2. THE Outbound System SHALL allow selecting multiple payment methods simultaneously
3. WHEN the warehouse staff enters paid amount, THE Outbound System SHALL calculate debt amount as: final total - paid amount
4. WHEN debt amount is greater than zero, THE Outbound System SHALL display it with red color indicator
5. WHEN debt amount is zero or negative, THE Outbound System SHALL display it with green color indicator

---

### Requirement 11: Validation và Error Handling

**User Story:** As a warehouse staff, I want to receive clear validation messages, so that I can correct errors before submitting the outbound receipt.

#### Acceptance Criteria

1. WHEN the warehouse staff attempts to submit without products, THE Outbound System SHALL display error message "Vui lòng thêm ít nhất 1 sản phẩm"
2. WHEN the warehouse staff attempts to submit with insufficient stock and status is not "draft", THE Outbound System SHALL display error message "Không đủ hàng trong kho"
3. WHEN the warehouse staff enters invalid customer phone, THE Outbound System SHALL display error message "Số điện thoại không hợp lệ"
4. WHEN API request fails, THE Outbound System SHALL display error message "Có lỗi xảy ra, vui lòng thử lại"
5. WHEN submission is successful, THE Outbound System SHALL display success message "Tạo phiếu xuất kho thành công"

---

### Requirement 12: UI/UX Requirements

**User Story:** As a warehouse staff, I want an intuitive and responsive interface, so that I can work efficiently on any device.

#### Acceptance Criteria

1. THE Outbound System SHALL display the receipt number prominently in the header
2. THE Outbound System SHALL use color-coded status badges for visual clarity
3. THE Outbound System SHALL display available stock with color indicators (green: sufficient, yellow: low, red: insufficient)
4. THE Outbound System SHALL provide responsive layout that works on desktop and tablet devices
5. THE Outbound System SHALL use icons consistently throughout the interface
6. THE Outbound System SHALL group related fields into cards with clear section titles

---

### Requirement 13: Navigation và Actions

**User Story:** As a warehouse staff, I want clear navigation and action buttons, so that I can complete tasks efficiently.

#### Acceptance Criteria

1. THE Outbound System SHALL provide a "Cancel" button that returns to the previous page
2. THE Outbound System SHALL provide a "Save" button that submits the outbound receipt
3. WHEN the warehouse staff clicks "Add New Product", THE Outbound System SHALL navigate to the product creation page with return URL
4. WHEN submission is successful, THE Outbound System SHALL redirect to the stock management page
5. THE Outbound System SHALL disable the submit button while processing to prevent double submission

---

### Requirement 14: Data Persistence

**User Story:** As an inventory manager, I want all outbound data to be persisted reliably, so that no information is lost.

#### Acceptance Criteria

1. THE Outbound System SHALL store outbound receipts in the stock-movements.json file
2. THE Outbound System SHALL generate unique IDs for each outbound receipt
3. THE Outbound System SHALL store all receipt fields including items, calculations, and metadata
4. THE Outbound System SHALL update inventory.json when stock quantities change
5. THE Outbound System SHALL maintain data integrity across related files

---

### Requirement 15: API Requirements

**User Story:** As a developer, I want well-structured API endpoints, so that the frontend can interact with the backend reliably.

#### Acceptance Criteria

1. THE Outbound System SHALL provide POST /api/inventory/movements endpoint for creating outbound receipts
2. THE Outbound System SHALL validate authentication token before processing requests
3. THE Outbound System SHALL require admin role for creating outbound receipts
4. THE Outbound System SHALL return appropriate HTTP status codes (201 for success, 400 for validation errors, 401 for unauthorized, 500 for server errors)
5. THE Outbound System SHALL return detailed error messages in Vietnamese

---

## Non-Functional Requirements

### Performance
- Form should load within 2 seconds
- Product search should return results within 500ms
- Stock validation should complete within 1 second
- Receipt submission should complete within 3 seconds

### Security
- Only authenticated admin users can create outbound receipts
- All API requests must include valid JWT token
- Input validation on both frontend and backend
- SQL injection prevention (not applicable for JSON storage)

### Usability
- Interface in Vietnamese language
- Clear error messages
- Responsive design for desktop and tablet
- Keyboard shortcuts for common actions

### Reliability
- Data backup before modifications
- Transaction-like operations for stock updates
- Error recovery mechanisms
- Audit trail for all changes

---

## Future Enhancements (Out of Scope for Phase 1)

- Batch and serial number tracking
- Picking location management
- Photo verification
- Shipping integration (GHN, GHTK)
- Bulk outbound processing
- Barcode scanning
- Mobile app support
- Advanced reporting
