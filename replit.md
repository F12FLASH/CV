# Portfolio Website - Replit.md

## Overview

This is a modern full-stack portfolio website built for "Loi Developer" - a full-stack developer and creative coder. The application features a dark-themed, visually striking frontend with 3D elements, animations, and a comprehensive admin dashboard for content management. It's built using React with TypeScript on the frontend, Express on the backend, and PostgreSQL with Drizzle ORM for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript and Vite for build tooling
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** React Context API for mock data and authentication, TanStack Query for server state
- **UI Framework:** Radix UI components with shadcn/ui styling system
- **Styling:** Tailwind CSS v4 with custom theme configuration
- **Animations:** Framer Motion for UI animations
- **3D Graphics:** React Three Fiber with Drei helpers for 3D elements

**Design Decisions:**
- Dark mode by default to achieve a "creative coder" aesthetic
- Component-based architecture with clear separation between UI components, sections, and pages
- Custom theming system using CSS variables for flexible color management
- Path aliases configured for clean imports (@/, @shared/, @assets/)

**Component Structure:**
- `/client/src/components/ui/` - Reusable UI primitives (buttons, cards, forms, etc.)
- `/client/src/components/admin/` - Admin-specific components (rich editor, pagination, batch actions)
- `/client/src/components/sections/` - Homepage sections (Hero, About, Skills, Projects, etc.)
- `/client/src/components/layout/` - Layout components (Navbar, Footer, AdminLayout)
- `/client/src/pages/` - Route pages including extensive admin dashboard pages

**Key Features:**
- Portfolio showcase with project filtering
- Blog/posts section with featured images (device upload + URL support)
- Contact form with floating label inputs
- Testimonials carousel
- Skills visualization with animated progress bars
- Admin dashboard with multiple management interfaces (projects, posts, users, media, analytics, etc.)

**Recent Updates (Nov 30, 2025):**
- Fixed TypeScript errors in Posts.tsx (added missing required fields: slug, content, excerpt, featuredImage, tags, publishedAt)
- Enhanced featured image functionality:
  - File upload from device (auto-converts to base64 data URL)
  - URL input for image links (supports all image formats)
  - Image preview with fallback error handling
  - Automatic fallback to default background images if image fails to load

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Build System:** esbuild for server bundling, Vite for client
- **Development:** tsx for TypeScript execution in dev mode

**Design Decisions:**
- RESTful API structure with all routes prefixed with `/api`
- Storage abstraction layer (`IStorage` interface) allowing for multiple implementations
- Currently using in-memory storage (`MemStorage`) as default
- Prepared for database integration with Drizzle ORM
- Static file serving for production builds
- HMR (Hot Module Replacement) support in development via Vite middleware

**Server Organization:**
- `/server/index.ts` - Main server entry point with Express configuration and request logging
- `/server/routes.ts` - API route registration
- `/server/storage.ts` - Storage abstraction with in-memory implementation
- `/server/static.ts` - Static file serving for production
- `/server/vite.ts` - Vite dev server integration for development HMR

**Key Architectural Patterns:**
- Separation of concerns between routing, business logic, and data access
- Custom request logging middleware with timestamp formatting
- Raw body capture for webhook/payment integrations
- Environment-based execution (development vs. production)

### Data Storage

**Database Configuration:**
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL (via Neon serverless driver)
- **Schema Location:** `/shared/schema.ts`
- **Migrations:** Managed via drizzle-kit, output to `/migrations/`

**Current Schema:**
- `users` table with id (UUID), username (unique), and password fields
- Zod validation schemas for type-safe inserts

**Design Decisions:**
- Shared schema between client and server for type safety
- UUID generation handled by database
- Validation layer using drizzle-zod for runtime type checking
- Storage interface allows switching between in-memory and database implementations

**Note:** The application is currently using in-memory storage but is fully prepared for PostgreSQL integration. The storage interface abstraction means database operations can be added without changing the API contract.

### Build & Deployment

**Build Process:**
- Client build via Vite → outputs to `/dist/public/`
- Server build via esbuild → outputs to `/dist/index.cjs`
- Selective dependency bundling (allowlist approach) to reduce cold start times
- Production runs the compiled CommonJS bundle

**Development Workflow:**
- Concurrent dev servers: Vite (port 5000) for client, tsx for server
- Vite middleware integration for HMR during development
- TypeScript checking via `tsc` in noEmit mode

**Environment Variables:**
- `DATABASE_URL` - Required for PostgreSQL connection
- `NODE_ENV` - Controls development vs. production behavior
- `REPL_ID` - Replit-specific features enabled when present

## External Dependencies

### UI Libraries
- **Radix UI:** Accessible, unstyled component primitives (accordion, dialog, dropdown, etc.)
- **Tailwind CSS:** Utility-first CSS framework with v4 configuration
- **Framer Motion:** Animation library for smooth UI transitions
- **Lucide React:** Icon library

### 3D Graphics
- **Three.js:** 3D rendering via React Three Fiber
- **@react-three/drei:** Three.js helpers (OrbitControls, Float, PerspectiveCamera)
- **@react-three/fiber:** React renderer for Three.js

### Form Handling
- **React Hook Form:** Form state management
- **Zod:** Schema validation
- **@hookform/resolvers:** Zod integration for react-hook-form

### Data Fetching
- **TanStack Query (React Query):** Server state management and caching

### Database & ORM
- **Drizzle ORM:** Type-safe ORM for PostgreSQL
- **@neondatabase/serverless:** Serverless PostgreSQL driver
- **drizzle-zod:** Zod schema generation from Drizzle schemas

### Routing
- **Wouter:** Lightweight client-side routing (~1.5KB)

### Theming
- **next-themes:** Dark/light mode management (despite not using Next.js)

### Development Tools
- **Vite:** Frontend build tool and dev server
- **esbuild:** Fast JavaScript bundler for server code
- **TypeScript:** Static typing
- **@replit/vite-plugin-*:** Replit-specific development enhancements (error modal, cartographer, dev banner)

### Additional Dependencies
- **date-fns:** Date manipulation utilities
- **class-variance-authority & clsx:** Conditional className utilities
- **nanoid:** Unique ID generation
- **react-type-animation:** Typing animation effects
- **cmdk:** Command menu component