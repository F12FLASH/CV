# Portfolio Website

## Overview

This project is a modern, full-stack portfolio website designed for a full-stack developer, "Loi Developer." It features a dark-themed, visually rich frontend with 3D elements, animations, and a comprehensive admin dashboard for content management. The technology stack includes React with TypeScript for the frontend, Express for the backend, and PostgreSQL with Drizzle ORM for data persistence. The site aims to showcase projects, blog posts, and provide administrative tools for content management and user interaction. Key ambitions include a visually appealing user experience, robust content management capabilities, and a scalable architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built using React 18 with TypeScript, Vite for tooling, Wouter for routing, and React Context API/TanStack Query for state management. Radix UI and shadcn/ui provide the component foundation, styled with Tailwind CSS v4. Animations are handled by Framer Motion, and 3D elements are integrated using React Three Fiber. The design emphasizes a dark mode aesthetic, component-based structure, and custom theming. Key features include a portfolio showcase, blog, contact form, testimonials, skills visualization, and an extensive admin dashboard with CRUD operations for projects, posts, categories, comments, and reviews. Recent enhancements focus on real-time notifications via WebSockets, an auto-approval system for comments/reviews, a redesigned preloader, comprehensive site settings management, and improved notification UX.

**Frontend Page Organization (Domain-Centric):**

```
client/src/pages/
├── home/                    # Public-facing pages
│   ├── Home.tsx            # Landing page
│   ├── Blog.tsx            # Blog listing
│   ├── BlogPost.tsx        # Individual blog post
│   ├── Projects.tsx        # Projects showcase
│   ├── Pages.tsx           # Dynamic CMS pages
│   ├── PageDetail.tsx      # Individual page view
│   ├── Maintenance.tsx     # Maintenance mode
│   └── not-found.tsx       # 404 page
│
└── admin/                   # Admin dashboard (10 functional domains)
    ├── auth/               # Login
    ├── dashboard/          # Dashboard, Analytics
    ├── content/            # Organized by content type
    │   ├── posts/          # Posts, PostCategories
    │   ├── projects/       # Projects, ProjectCategories
    │   ├── services/       # Services management
    │   ├── skills/         # Skills management
    │   └── testimonials/   # Testimonials
    ├── communications/     # Inbox, Comments, Notifications, Newsletter, EmailTemplates
    ├── settings/           # Site settings, Theme, Language, SEO
    ├── security/           # Security, Webhooks, APIKeys
    ├── system/             # System, Cache, Logs, ActivityLog, ExportImport, APIDocs
    ├── tools/              # Media, ImageOptimizer, Scheduler, FileManager
    ├── pages/              # CMS Pages, PageBuilder, FAQs, Editor
    └── users/              # Profile, Users, Roles
```

All admin pages use React.lazy() for code splitting to optimize bundle size.

### Security & CAPTCHA Integration

The application includes a flexible CAPTCHA system supporting multiple providers:
- **Local Verification**: Server-side honeypot fields and time-based validation for basic bot protection
- **Google reCAPTCHA v3**: Invisible verification with risk analysis scoring
- **Cloudflare Turnstile**: Privacy-first alternative with widget rendering

Configuration is managed through the admin Security panel (`/admin/security` > Recaptcha tab). The `useRecaptcha` hook (`client/src/hooks/use-recaptcha.ts`) provides:
- Automatic script loading for selected provider
- Form protection based on admin settings
- Honeypot field integration
- Time-based validation for form submissions

Forms protected: Login, Contact, Registration, Newsletter, Comments.

### Two-Factor Authentication (2FA)

The application supports multiple 2FA methods:
- **TOTP (Time-based One-Time Password)**: Uses `speakeasy` library for generating/verifying codes. Compatible with Google Authenticator, Authy, etc.
- **WebAuthn/Biometric Login**: Uses `@simplewebauthn/server` for passwordless authentication with fingerprint, Face ID, or security keys.

#### 2FA Session Flow (Security Architecture)
1. **Password Login**: Sets only `pending2FA=true` and `pendingUserId` in session - no full access granted
2. **Second Factor Verification**: 
   - Both TOTP and WebAuthn endpoints require `pending2FA=true` AND `pendingUserId` to be set
   - Session is regenerated INSIDE the callback to prevent session fixation attacks
   - Full session (`userId`, `username`, `role`) set only after successful verification
3. **Protected Routes**: `requireAuth` and `requireAdmin` middlewares block access if `pending2FA=true`

#### Security Measures
- Session regeneration prevents session fixation attacks
- WebAuthn challenge farming prevented by requiring pending 2FA state
- Login history stored in `securityLogs` table for audit trail
- Password expiration enforcement configurable via admin settings
- Trusted devices management for remembered authentication

### Backend Architecture

The backend utilizes Node.js with Express.js and TypeScript. It follows a RESTful API design with modular architecture:

**Directory Structure:**
- `server/api/` - 25 separate API route modules (auth, users, projects, posts, etc.)
- `server/middleware/` - Authentication and security middleware
- `server/utils/` - Shared utilities (upload, password, captcha)
- `server/` - Core files (index.ts, routes.ts, storage.ts, db.ts, websocket.ts)

**API Route Modules:**
- Authentication: `auth.ts`, `security.ts`
- Content: `posts.ts`, `projects.ts`, `pages.ts`, `skills.ts`, `services.ts`, `testimonials.ts`
- User Management: `users.ts`, `notifications.ts`, `activity-logs.ts`
- Admin: `settings.ts`, `dashboard.ts`, `database.ts`, `logs.ts`, `performance.ts`
- Interactions: `comments.ts`, `reviews.ts`, `messages.ts`, `newsletter.ts`
- Utilities: `media.ts`, `storage.ts`, `categories.ts`, `faqs.ts`, `homepage.ts`

`esbuild` handles server bundling for production, and `tsx` is used for development. The server is structured to separate concerns between routing, business logic, and data access, with custom logging and environment-based configuration. WebSocket integration provides real-time communication for notifications.

### Data Storage

Data persistence is managed with PostgreSQL via the Neon serverless driver and Drizzle ORM. The schema is shared between client and server for type safety, with migrations managed by `drizzle-kit`. Zod is used for validation. The architecture supports switching between in-memory and database storage seamlessly. The database includes tables for users, posts, projects, categories, comments, reviews, and site settings, with features like UUID generation and type-safe inserts.

### Build & Deployment

The build process involves Vite for the client (outputting to `/dist/public/`) and esbuild for the server (outputting to `/dist/index.cjs`). Development uses concurrent servers with Vite middleware for HMR. Environment variables manage database connections and runtime behavior.

## External Dependencies

### UI & Graphics
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Framer Motion**: Animation library.
- **Lucide React**: Icon library.
- **Three.js, @react-three/fiber, @react-three/drei**: 3D graphics rendering.

### Forms & Data
- **React Hook Form**: Form state management.
- **Zod**: Schema validation.
- **TanStack Query**: Server state management and caching.

### Database
- **Drizzle ORM**: Type-safe ORM for PostgreSQL.
- **@neondatabase/serverless**: Serverless PostgreSQL driver.
- **drizzle-zod**: Zod schema generation from Drizzle schemas.

### Core Utilities
- **Wouter**: Lightweight client-side routing.
- **date-fns**: Date manipulation.
- **nanoid**: Unique ID generation.
- **react-type-animation**: Typing effects.
- **cmdk**: Command menu component.

### Development
- **Vite**: Frontend build tool.
- **esbuild**: Server code bundler.
- **TypeScript**: Static typing.