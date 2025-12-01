# Portfolio Website

## Overview

This project is a modern, full-stack portfolio website designed for a full-stack developer, "Loi Developer." It features a dark-themed, visually rich frontend with 3D elements, animations, and a comprehensive admin dashboard for content management. The technology stack includes React with TypeScript for the frontend, Express for the backend, and PostgreSQL with Drizzle ORM for data persistence. The site aims to showcase projects, blog posts, and provide administrative tools for content management and user interaction. Key ambitions include a visually appealing user experience, robust content management capabilities, and a scalable architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built using React 18 with TypeScript, Vite for tooling, Wouter for routing, and React Context API/TanStack Query for state management. Radix UI and shadcn/ui provide the component foundation, styled with Tailwind CSS v4. Animations are handled by Framer Motion, and 3D elements are integrated using React Three Fiber. The design emphasizes a dark mode aesthetic, component-based structure, and custom theming. Key features include a portfolio showcase, blog, contact form, testimonials, skills visualization, and an extensive admin dashboard with CRUD operations for projects, posts, categories, comments, and reviews. Recent enhancements focus on real-time notifications via WebSockets, an auto-approval system for comments/reviews, a redesigned preloader, comprehensive site settings management, and improved notification UX.

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

### Backend Architecture

The backend utilizes Node.js with Express.js and TypeScript. It follows a RESTful API design, with an abstraction layer for storage (currently in-memory, but prepared for PostgreSQL). `esbuild` handles server bundling for production, and `tsx` is used for development. The server is structured to separate concerns between routing, business logic, and data access, and includes custom logging and environment-based configuration. WebSocket integration provides real-time communication for notifications.

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