# Loi Developer Portfolio - Full-Stack CMS Platform

## Giới Thiệu

**Loi Developer Portfolio** là một nền tảng website portfolio hiện đại, đầy đủ tính năng được xây dựng cho nhà phát triển full-stack. Hệ thống bao gồm một frontend dark-theme đẹp mắt với các hiệu ứng 3D, animations và một bảng điều khiển admin toàn diện để quản lý nội dung.

### Công Nghệ Sử Dụng

| Phân loại | Công nghệ |
|-----------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v4 |
| **UI Components** | Radix UI, shadcn/ui, Framer Motion |
| **3D Graphics** | React Three Fiber, Three.js |
| **State Management** | TanStack Query, React Context API |
| **Routing** | Wouter |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL với Drizzle ORM |
| **Authentication** | Passport.js, Express Session |
| **Real-time** | WebSocket |

---

## Cấu Trúc Dự Án

```
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── admin/          # Admin-specific components
│   │   │   ├── common/         # Common utilities (LazyImage, SEO, SocialShare)
│   │   │   ├── layout/         # Layout components (Navbar, Footer)
│   │   │   ├── sections/       # Homepage sections
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── context/            # React Context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Page layouts
│   │   ├── lib/                # Utility functions
│   │   └── pages/              # Page components
│   │       ├── admin/          # Admin dashboard pages
│   │       └── home/           # Public-facing pages
├── server/                     # Backend Express application
│   ├── api/                    # API route handlers
│   ├── middleware/             # Express middlewares
│   ├── utils/                  # Utility functions
│   └── ...
├── shared/                     # Shared types and schemas
└── uploads/                    # Uploaded media files
```

---

## Danh Sách Chức Năng

### 1. TRANG CÔNG CỘNG (Public Pages)

#### 1.1 Trang Chủ (Homepage)
- **Hero Section**: Banner chính với tiêu đề, subtitle và call-to-action
- **About Section**: Giới thiệu cá nhân với avatar và thông tin liên hệ
- **Skills Section**: Hiển thị kỹ năng với thanh tiến trình và phân loại
- **Projects Section**: Showcase dự án với bộ lọc theo danh mục
- **Services Section**: Danh sách dịch vụ cung cấp
- **Testimonials Section**: Đánh giá từ khách hàng
- **Blog Section**: Bài viết blog mới nhất
- **Contact Section**: Form liên hệ
- **Newsletter Section**: Đăng ký nhận bản tin

#### 1.2 Trang Blog
- Danh sách bài viết với phân trang
- Lọc theo danh mục
- Tìm kiếm bài viết
- Chi tiết bài viết với hình ảnh, nội dung rich-text
- Hệ thống bình luận

#### 1.3 Trang Dự Án
- Gallery dự án với bộ lọc
- Chi tiết dự án với hình ảnh, mô tả, công nghệ sử dụng
- Link demo và GitHub
- Hệ thống đánh giá (reviews)

#### 1.4 Trang FAQs
- Câu hỏi thường gặp với accordion

#### 1.5 Trang CMS Động
- Trang tĩnh được tạo từ admin

#### 1.6 Chế Độ Bảo Trì
- Hiển thị trang bảo trì khi admin bật chế độ maintenance

---

### 2. BẢNG ĐIỀU KHIỂN ADMIN (Admin Dashboard)

#### 2.1 Dashboard Chính
- **Thống kê tổng quan**: Số lượng projects, posts, comments, messages
- **Biểu đồ**: Xu hướng views theo thời gian
- **Hoạt động gần đây**: Activity log
- **Tin nhắn mới**: Danh sách tin nhắn chưa đọc

#### 2.2 Quản Lý Nội Dung (Content Management)

##### Blog Posts
- Tạo, sửa, xóa bài viết
- Rich-text editor với TipTap
- Hình ảnh đại diện
- Tags và danh mục
- Trạng thái: Draft, Published
- Đánh dấu bài viết nổi bật

##### Projects
- Tạo, sửa, xóa dự án
- Hình ảnh showcase
- Mô tả ngắn và chi tiết
- Công nghệ sử dụng (tags)
- Link demo và GitHub
- Trạng thái và featured

##### Pages (CMS)
- Tạo trang tĩnh tùy chỉnh
- URL slug tự động
- Meta title và description cho SEO
- Trạng thái xuất bản

##### Categories
- Quản lý danh mục cho Posts
- Quản lý danh mục cho Projects
- Slug tự động từ tên

##### Services
- Danh sách dịch vụ cung cấp
- Icon, mô tả, tính năng
- Giá cả
- Thứ tự hiển thị

##### Skills
- Kỹ năng với mức độ thành thạo (%)
- Phân loại (Frontend, Backend, Database, DevOps)
- Icon tùy chỉnh

##### Testimonials
- Đánh giá từ khách hàng
- Tên, vai trò, công ty
- Avatar
- Số sao đánh giá

##### FAQs
- Câu hỏi và trả lời
- Thứ tự hiển thị
- Ẩn/hiện

---

#### 2.3 Giao Tiếp (Communications)

##### Inbox (Hộp Thư)
- Nhận tin nhắn từ form liên hệ
- Đánh dấu đã đọc/chưa đọc
- Lưu trữ (archive)
- Gắn thẻ (tags)
- Xóa tin nhắn

##### Comments
- Quản lý bình luận bài viết và dự án
- Phê duyệt/từ chối
- Trả lời bình luận
- Đánh dấu đã đọc
- Hỗ trợ nested replies

##### Reviews
- Quản lý đánh giá dự án
- Phê duyệt/từ chối
- Xem rating

##### Newsletter
- Quản lý subscribers
- Tạo và gửi email campaigns
- Email templates tùy chỉnh
- Thống kê open/click rate
- Unsubscribe handling

##### Notifications
- Thông báo real-time qua WebSocket
- Badge đếm số thông báo chưa đọc
- Lịch sử thông báo

##### Email Templates
- Templates cho newsletter
- Templates cho transactional emails
- Variables động ({{name}}, {{site_name}}, etc.)

---

#### 2.4 Media & Assets

##### Media Library
- Upload hình ảnh và documents
- Gallery view
- Xem thông tin file (size, type, dimensions)
- Xóa files
- Copy URL

##### Image Optimizer
- Tối ưu hóa hình ảnh
- Resize, compress
- Chuyển đổi format

##### File Manager
- Quản lý files trong thư mục uploads
- Tổ chức theo folders

---

#### 2.5 Bảo Mật (Security Center)

##### Authentication
- Đăng nhập bằng username/password
- Two-Factor Authentication (2FA) với TOTP
- WebAuthn/Biometric login
- Quên mật khẩu và reset

##### Session Management
- Xem sessions đang hoạt động
- Đăng xuất từ xa
- Session timeout tự động

##### IP Rules
- IP Whitelist
- IP Blacklist
- Auto-block sau nhiều lần đăng nhập thất bại

##### Rate Limiting
- Giới hạn requests per minute
- Bảo vệ API endpoints

##### CAPTCHA Integration
- Local CAPTCHA
- Google reCAPTCHA v3
- Cloudflare Turnstile

##### Security Logs
- Lịch sử đăng nhập
- Bot blocked events
- Suspicious activities

##### Password Policy
- Yêu cầu độ phức tạp mật khẩu
- Password expiration
- Password history

---

#### 2.6 Hệ Thống (System)

##### System Info
- Thông tin server
- Database status
- Storage usage
- Memory/CPU stats

##### Activity Log
- Lịch sử hoạt động admin
- Ai làm gì, khi nào
- Filter theo loại hoạt động

##### System Logs
- Error logs
- Access logs
- Debug logs

##### Cache Management
- Clear cache
- Cache statistics

##### Database Management
- Database backup
- Seed data

##### Export/Import
- Export dữ liệu ra JSON
- Import dữ liệu từ backup

##### API Documentation
- Tài liệu API endpoints
- Interactive testing

##### Scheduled Tasks
- Quản lý cron jobs
- Task scheduling

##### Webhooks
- Tạo webhooks cho events
- Webhook logs

---

#### 2.7 Cài Đặt (Settings)

##### General Settings
- Site title và tagline
- Contact email
- Maintenance mode

##### Hero Section
- Hero title và subtitle
- Call-to-action text
- CV file upload

##### About Section
- About title và description
- Personal info (name, location)
- Avatar image

##### Contact Section
- Contact info (phone, address)
- Social media links

##### Branding
- Logo upload
- Favicon
- Site colors

##### SEO
- Meta title và description mặc định
- Open Graph settings
- Sitemap generation

##### Email Settings
- SMTP configuration
- Email sender info
- Email templates

##### Storage
- Local storage settings
- Cloud storage (AWS S3, Cloudflare R2)

##### Performance
- Lazy loading
- Image optimization
- Caching options

##### Localization
- Language selection
- Translation management
- Date/time format

##### Developer Options
- Debug mode
- API keys
- Custom CSS/JavaScript injection

##### Notifications Settings
- Email notifications
- Browser notifications
- Auto-approve comments/reviews

---

#### 2.8 Công Cụ (Tools)

##### Code Editor
- Chỉnh sửa custom CSS
- Chỉnh sửa custom JavaScript
- Syntax highlighting

##### Page Builder
- Drag-and-drop page builder
- Pre-built blocks

##### Theme Customization
- Color palette
- Typography
- Spacing
- Dark/Light mode

##### Analytics
- Page views statistics
- Popular content
- Traffic sources
- User engagement

---

### 3. TÍNH NĂNG KỸ THUẬT

#### 3.1 Authentication & Authorization
- Session-based authentication với Express Session
- Password hashing với bcrypt
- Two-Factor Authentication (TOTP)
- WebAuthn/Passkeys support
- Role-based access control
- Protected API routes

#### 3.2 Real-time Features
- WebSocket integration
- Real-time notifications
- Live updates cho comments/reviews

#### 3.3 Database
- PostgreSQL với Drizzle ORM
- Type-safe queries
- Relationship handling
- Automatic migrations

#### 3.4 API Architecture
- RESTful API design
- Request validation với Zod
- Error handling middleware
- Rate limiting

#### 3.5 Frontend Features
- Server-side state với TanStack Query
- Lazy loading cho pages
- Optimistic updates
- Toast notifications
- Form validation
- Responsive design
- Dark/Light theme

#### 3.6 SEO Optimization
- Meta tags management
- Open Graph support
- Sitemap generation
- Semantic HTML

#### 3.7 Performance
- Code splitting
- Lazy loading images
- Caching strategies
- Optimized bundles

---

## Hướng Dẫn Cài Đặt

### Yêu Cầu
- Node.js 18+
- PostgreSQL database
- npm hoặc yarn

### Cài Đặt

1. Clone repository
2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Tạo database PostgreSQL và cấu hình biến môi trường:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

4. Chạy database migrations:
   ```bash
   npm run db:push
   ```

5. (Tùy chọn) Seed dữ liệu mẫu:
   ```bash
   npm run seed
   ```

6. Khởi động development server:
   ```bash
   npm run dev
   ```

7. Truy cập:
   - Website: http://localhost:5000
   - Admin: http://localhost:5000/admin

### Tài Khoản Admin Mặc Định
- Username: `admin`
- Password: `admin123`

---

## API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |
| POST | `/api/auth/2fa/setup` | Thiết lập 2FA |
| POST | `/api/auth/2fa/verify` | Xác minh 2FA |

### Content
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET/POST | `/api/projects` | Quản lý dự án |
| GET/POST | `/api/posts` | Quản lý bài viết |
| GET/POST | `/api/pages` | Quản lý trang CMS |
| GET/POST | `/api/services` | Quản lý dịch vụ |
| GET/POST | `/api/skills` | Quản lý kỹ năng |
| GET/POST | `/api/testimonials` | Quản lý testimonials |
| GET/POST | `/api/categories` | Quản lý danh mục |
| GET/POST | `/api/faqs` | Quản lý FAQs |

### Communications
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET/POST | `/api/messages` | Quản lý tin nhắn |
| GET/POST | `/api/comments` | Quản lý bình luận |
| GET/POST | `/api/reviews` | Quản lý đánh giá |
| GET/POST | `/api/subscribers` | Quản lý subscribers |
| GET/POST | `/api/email-campaigns` | Quản lý email campaigns |
| GET/POST | `/api/notifications` | Quản lý thông báo |

### System
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET/PUT | `/api/settings` | Cài đặt website |
| GET | `/api/dashboard` | Dashboard statistics |
| GET | `/api/activity-logs` | Activity logs |
| GET/POST | `/api/security/*` | Security settings |
| GET/POST | `/api/media` | Media management |
| GET | `/api/analytics` | Analytics data |

---

## Bảo Mật

Hệ thống được trang bị nhiều lớp bảo mật:

1. **Authentication**: Session-based với secure cookies
2. **Password Security**: Bcrypt hashing, password policy
3. **2FA**: TOTP và WebAuthn support
4. **Rate Limiting**: Chống brute-force
5. **IP Filtering**: Whitelist/Blacklist
6. **CAPTCHA**: Chống bot
7. **XSS/SQL Injection Protection**: Input validation
8. **CSRF Protection**: Session tokens
9. **Security Logging**: Audit trail

---

## License

MIT License

---

## Tác Giả

**Loi Developer** - Full-stack Developer

- Website: [loideveloper.com](https://loideveloper.com)
- Email: loideveloper@example.com
- GitHub: [@loideveloper](https://github.com/loideveloper)
