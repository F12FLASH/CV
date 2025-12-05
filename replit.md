# Loi Developer Portfolio - Full-Stack CMS Platform

## Overview

This is a modern, full-stack portfolio website and content management system (CMS) built for developers. The platform features a dark-themed frontend with 3D graphics, animations, and comprehensive admin capabilities including content management, user authentication with 2FA/WebAuthn, analytics tracking, email campaigns, and advanced security features.

The application uses a monorepo structure with a React/TypeScript frontend built with Vite, an Express/TypeScript backend, and PostgreSQL database with Drizzle ORM. It includes real-time features via WebSocket, rich text editing with TipTap, and extensive API endpoints for managing all content types.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type safety
- Vite as the build tool for fast development and optimized production builds
- Tailwind CSS v4 for styling with custom theme configuration supporting dark mode by default
- Wouter for lightweight client-side routing

**UI Components:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library (New York style) integrated via `components.json`
- Framer Motion for animations and transitions
- React Three Fiber and Three.js for 3D graphics rendering

**State Management:**
- TanStack Query (React Query) for server state management, caching, and data fetching
- React Context API for global UI state (Site settings, Language, Mock data)
- Express Session for authentication state

**Project Structure:**
- `/client/src/components/` - Reusable components organized by domain (admin, common, layout, sections, ui)
- `/client/src/pages/` - Page components split between public (home) and admin areas
- `/client/src/hooks/` - Custom React hooks for shared logic
- `/client/src/context/` - Context providers for global state
- `/client/src/lib/` - Utility functions and shared configuration

**Build Configuration:**
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)
- Custom Vite plugins for meta image updates and Replit-specific features
- PostCSS with Tailwind for CSS processing

### Backend Architecture

**Technology Stack:**
- Node.js with Express framework
- TypeScript for type safety across frontend and backend
- Session-based authentication with PostgreSQL session store (connect-pg-simple)
- Passport.js for authentication strategies

**API Design:**
- RESTful API endpoints organized by resource type in `/server/api/`
- Middleware-based architecture for authentication, authorization, and security
- Centralized error handling and validation using Zod schemas
- Rate limiting and IP filtering for security

**Authentication & Authorization:**
- Session-based auth with secure HTTP-only cookies
- Multi-factor authentication (2FA) using TOTP (Speakeasy)
- WebAuthn/Passkey support via SimpleWebAuthn
- Password reset flow with time-limited tokens
- Role-based access control (Super Admin, Admin, Editor, Moderator, Subscriber)

**Key Features:**
- File upload handling with Multer (images, documents)
- Email functionality via Nodemailer with template support
- WebSocket server for real-time notifications and updates
- CAPTCHA verification support (Google reCAPTCHA, local validation)
- Scheduled tasks and background jobs (password expiry checks)
- Activity logging and security audit trails

**Security Middleware:**
- IP whitelist/blacklist enforcement
- Rate limiting per endpoint
- Login attempt tracking with lockout
- User agent filtering
- Geo-blocking capabilities
- Firewall rules

### Data Storage

**Database:**
- PostgreSQL as primary database (via Neon serverless driver)
- Drizzle ORM for type-safe database queries
- Schema defined in `/shared/schema.ts` and shared between frontend and backend

**Database Schema Design:**
- User management (users, sessions, trusted devices, WebAuthn credentials)
- Content management (projects, posts, pages, skills, services, testimonials)
- Media library (media files with folders)
- Engagement (comments, reviews, messages, notifications)
- Organization (categories for projects/posts, tags)
- Site configuration (settings, security settings, homepage sections)
- Email system (subscribers, templates, campaigns)
- Security (activity logs, security logs, IP rules, firewall rules, blocked requests)
- Advanced features (translations, content versions/drafts, scheduled content, search history, page views)
- Integrations (webhooks, scheduled tasks)

**Storage Layer (`/server/storage.ts`):**
- Centralized data access layer abstracting Drizzle ORM operations
- All CRUD operations for each entity type
- Complex queries (filtering, pagination, sorting)
- Relationship handling and joins

**Migrations:**
- Drizzle Kit for schema migrations
- Migration files stored in `/migrations/`
- Configuration in `drizzle.config.ts`

### External Dependencies

**Database Service:**
- Neon Serverless PostgreSQL (via `@neondatabase/serverless`)
- WebSocket support for connection pooling
- Environment variable `DATABASE_URL` required

**Email Service:**
- SMTP configuration stored in database settings
- Nodemailer for sending emails
- Support for custom templates and campaigns

**Authentication Services:**
- SimpleWebAuthn for passwordless authentication
- Speakeasy for TOTP-based 2FA
- QRCode generation for 2FA setup

**File Storage:**
- Local filesystem storage in `/uploads/` directory
- Organized into subdirectories (images, documents, media)
- Static file serving via Express

**External APIs:**
- Google reCAPTCHA for spam protection (optional)
- CAPTCHA secret key via environment variable

**Development Tools:**
- Replit-specific plugins for development banner and cartographer
- Runtime error overlay for better debugging

**Build & Deployment:**
- esbuild for server bundling in production
- Vite for client bundling
- Build script (`/script/build.ts`) bundles both client and server
- Production server runs from `/dist/` directory

**Real-time Communication:**
- WebSocket server (ws library) for live updates
- Broadcasts for new messages, comments, and notifications
- Mounted on same HTTP server as Express app at `/ws` path

**Content Editing:**
- TipTap editor with extensions for rich text, code blocks, highlights, and horizontal rules
- Syntax highlighting via Lowlight

**Image Processing:**
- Sharp library for image optimization (referenced in image-optimizer API)

**Session Management:**
- PostgreSQL-backed session store for persistence across restarts
- Session data includes user ID, username, role, and temporary 2FA state

**Environment Configuration:**
- Required: `DATABASE_URL`, `SESSION_SECRET` (production)
- Optional: `RECAPTCHA_SECRET_KEY`, `SITE_URL`, `RP_ID`, `ORIGIN`
- SMTP settings stored in database rather than environment