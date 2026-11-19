# FinG — Web App Quản Lý Tài Chính Cá Nhân Tối Giản (Minimalist Finance)

Ứng dụng web quản lý tài chính cá nhân được thiết kế theo phong cách **Minimalist**, tinh gọn, tập trung và không gây phân tâm.

![FinG Architecture](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Tính Năng Nổi Bật

1. **Giao Diện Minimalist & Dark Mode**:
   - Thiết kế tối giản, sạch sẽ, typography rõ ràng.
   - Hỗ trợ chế độ Sáng / Tối (Dark / Light Mode) chuyển đổi mượt mà.
   - Tối ưu hóa trên cả máy tính và điện thoại di động (Responsive).
   - Phím tắt nhanh: Nhấn `N` trên bàn phím để mở popup thêm giao dịch tức thì.

2. **Quản Lý Thu & Chi (Income & Expense)**:
   - Thêm, sửa, xóa các khoản thu nhập và chi tiêu.
   - Hỗ trợ chọn danh mục (Ăn uống, Đi lại, Mua sắm, Lương, Thưởng, Đầu tư...) và nguồn tiền/ví (Tiền mặt, Ngân hàng, Ví MoMo,...).
   - Các nút cộng nhanh số tiền (+50k, +100k, +500k, +1tr).
   - Bộ lọc linh hoạt: Lọc theo loại (Thu/Chi), theo danh mục, theo ví, tìm kiếm từ khóa theo ghi chú.
   - Nhóm giao dịch theo ngày trực quan kèm tổng thu chi theo từng ngày.
   - Xuất dữ liệu ra file **CSV** để xem trên Excel / Google Sheets.

3. **Báo Cáo Tài Chính Trực Quan (Analytics & Reports)**:
   - Thống kê các chỉ số cốt lõi: Tổng thu, Tổng chi, Tiết kiệm ròng, Tỷ lệ tiết kiệm (%).
   - Biểu đồ cột so sánh biến động dòng tiền Thu vs Chi theo thời gian thực (Recharts).
   - Biểu đồ Donut phân bổ cơ cấu chi tiêu theo từng danh mục.
   - Bảng phân tích chi tiết Top 5 khoản chi tiêu lớn nhất trong kỳ.
   - Lọc báo cáo linh hoạt: *Tháng này, Tháng trước, 30 ngày qua, Năm nay*.

4. **Sổ Ghi Chú Tài Chính (Financial Notes & Scratchpad)**:
   - Ghi lại các kế hoạch tài chính, mục tiêu tiết kiệm, danh sách mua sắm (Shopping Wishlist).
   - Hỗ trợ **Interactive Checklist**: Định dạng `- [ ] việc cần làm` có thể nhấn tick chọn trực tiếp ngay trên thẻ ghi chú.
   - Ghim các ghi chú quan trọng lên đầu danh sách.
   - Đánh dấu màu sắc (Xanh dương, Xanh lá, Vàng hổ phách, Tím, Hồng) và gắn hashtag phân loại.

5. **Xác Thực Đa Dạng (Email & Mật khẩu + Google OAuth + Demo Mode)**:
   - **Đăng ký / Đăng nhập bằng Email**: Hỗ trợ tạo tài khoản trực tiếp bằng email cá nhân với mật khẩu được băm bảo mật (`scrypt` + salt ngẫu nhiên).
   - **Đăng nhập Google**: Tích hợp chuẩn Google Identity Services (OAuth 2.0).
   - **Phân quyền dữ liệu độc lập**: Mỗi tài khoản (email hoặc Google) có không gian lưu trữ giao dịch, danh mục, ví và ghi chú riêng biệt.
   - **Chế độ Khách (Demo Mode)**: Trải nghiệm và kiểm thử ngay mọi chức năng với dữ liệu mẫu chân thực mà không bắt buộc đăng nhập.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu hệ thống
- **Node.js**: v18.x trở lên (đã kiểm thử và tối ưu trên Node v24).
- **Trình duyệt**: Chrome, Edge, Safari, Firefox.

### Các bước khởi chạy:

1. **Mở terminal tại thư mục dự án**:
   ```bash
   cd d:\FinG
   ```

2. **Cài đặt thư viện (nếu chưa cài)**:
   ```bash
   npm install
   ```

3. **Khởi chạy máy chủ phát triển (Development Server)**:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000`

4. **Biên dịch Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔑 Hướng Dẫn Cấu Hình Đăng Nhập Google (Google OAuth)

Nếu bạn muốn liên kết tài khoản Google thật của bạn với ứng dụng:

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo một Project mới (hoặc chọn project hiện có).
3. Vào mục **APIs & Services** > **Credentials**.
4. Tạo **OAuth 2.0 Client ID** (Application type: **Web application**).
5. Thêm `http://localhost:3000` vào:
   - **Authorized JavaScript origins**
6. Sao chép **Client ID** vừa tạo.
7. Mở file `.env.local` trong dự án và dán vào:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
   JWT_SECRET=fing-minimal-finance-secret-key-super-secure-2026
   ```
8. Khởi động lại `npm run dev`. Lúc này nút **Tiếp tục với Google** sẽ liên kết trực tiếp với tài khoản Google của bạn!

*(Lưu ý: Nếu chưa nhập Client ID, bạn vẫn có thể sử dụng đầy đủ mọi tính năng với nút "Trải nghiệm ngay" trong hộp thoại đăng nhập).*

---

## 🛠 Công Nghệ Sử Dụng (Tech Stack)

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Lucide Icons
- **Database**: `node:sqlite` (SQLite tích hợp sẵn cực nhẹ, không cần cài server cơ sở dữ liệu bên ngoài)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Authentication**: `@react-oauth/google` + JWT (jose) + HTTP-only Cookie
