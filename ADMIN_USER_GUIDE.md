# Admin Dashboard User Guide

## Getting Started

**Admin Login Credentials:**
- Email: `admin@gmail.com`
- Password: `123456`

---

## Dashboard Overview

### Left Sidebar Navigation
- **Dashboard** - Main dashboard with essay overview and analytics
- **Quản lý bài viết** - Manage essays (same as Dashboard)
- **Cài đặt hệ thống** - System settings and password management

### Top Header
- **Search Bar** (left) - Search essays by title or author
- **Notification Bell** (center-right) - Notifications indicator
- **Avatar Button** (right) - User menu and account options

---

## Features Guide

### 1. Avatar Menu (Top Right)
Click your avatar in the top-right corner to see:
- **Thông tin cá nhân** - View personal information
- **Cài đặt** - Go to settings page
- **Đăng xuất** - Logout and return to login page

### 2. Settings Page (`/admin/settings`)

#### Website Configuration
- **Website Name** - Change the site title displayed throughout the app
- **Text-to-Speech** - Toggle on/off the TTS feature for students

#### Change Password
1. Enter your current password
2. Enter your new password (minimum 6 characters)
3. Confirm the new password
4. Click "Lưu cài đặt" to save

Success/error messages will appear as toasts.

### 3. Managing Essays

#### View Essays
- Essays display in a table with columns:
  - Title
  - Class level
  - Category
  - Status (Published, Draft, Hidden)
  - Views count
  - Actions (Edit, Delete)

#### Filter by Status
Click tabs at the top of the table:
- **Tất cả** - Show all essays
- **Đã xuất bản** - Published only
- **Nháp** - Draft only
- **Ẩn** - Hidden only

#### Search Essays
Type in the search bar (top-left):
- Search by essay title
- Search by author name
- Results update in real-time

#### Change Essay Status
1. Click the status dropdown for any essay
2. Select new status: Published, Draft, or Hidden
3. Toast notification confirms the change

#### Edit Essay
1. Click the pencil icon on the right side of the essay row
2. Update any fields in the form
3. Click "Cập nhật" to save
4. Redirects back to dashboard

#### Delete Essay
1. Click the trash icon on the right side of the essay row
2. Confirmation modal appears asking to confirm
3. Shows the essay title to confirm you're deleting the right one
4. Click "Xóa" to confirm or "Hủy" to cancel
5. Success toast confirms deletion

### 4. Create New Essay
1. Click "+ Thêm bài" button (top of page)
2. Fill in all required fields:
   - **Tiêu đề** - Essay title
   - **Tác giả** - Author name
   - **Nội dung** - Essay content
3. Optional fields:
   - **Lớp** - Student class (6, 7, 8, or 9)
   - **Thể loại** - Essay type
   - **Dàn ý** - Outline sections (intro, body, conclusion)
   - **Trạng thái** - Publication status
4. Click "Tạo bài" to save
5. Success toast shows and redirects to dashboard

### 5. Toast Notifications

Toasts appear in the bottom-right corner and automatically disappear after 3 seconds.

**Green Toast (Success):**
- Essay created/updated successfully
- Status changed
- Settings saved

**Red Toast (Error):**
- Missing required fields
- Database error
- Operation failed

**Blue Toast (Info):**
- General information messages

---

## Tips & Shortcuts

1. **Bulk Status Changes** - Change multiple essays by updating their status dropdown
2. **Quick Search** - Use author name or partial title in search
3. **Keyboard Shortcuts** - Tab through fields in forms
4. **Back Navigation** - Click arrow button on settings page to return to dashboard
5. **Logout Anytime** - Click avatar > Đăng xuất from any admin page

---

## Common Tasks

### Create a New Essay
1. Click "+ Thêm bài"
2. Fill required fields
3. Click "Tạo bài"
4. View in table after redirect

### Publish a Draft Essay
1. Find the essay in the table
2. Click its status dropdown
3. Select "Đã xuất bản"
4. Confirm with green success toast

### Update Password
1. Click avatar > Cài đặt
2. Scroll to "Đổi mật khẩu" section
3. Enter current password, new password, and confirm
4. Click "Lưu cài đặt"
5. See success/error toast

### Find an Specific Essay
1. Type title or author in search bar
2. Table filters in real-time
3. Click edit or delete on the result

### Manage Website Settings
1. Click avatar > Cài đặt
2. Update website name if needed
3. Toggle Text-to-Speech on/off
4. Click "Lưu cài đặt"
5. Settings persist in localStorage

---

## Need Help?

All actions provide immediate feedback through:
- **Toast notifications** - Confirm success or show errors
- **Modal confirmations** - Prevent accidental deletions
- **Loading indicators** - Show when action is processing
- **Active highlighting** - Show which page you're on in sidebar

Errors will always display descriptive messages explaining what went wrong.
