
import { db } from "./db";
import { 
  users, projects, posts, skills, services, testimonials, 
  siteSettings, comments, reviews, categories, messages, 
  activityLogs, notifications, media 
} from "@shared/schema";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function seed() {
  console.log("Seeding database...");

  try {
    // Delete all existing data
    console.log("Deleting existing data...");
    await db.delete(activityLogs);
    await db.delete(notifications);
    await db.delete(comments);
    await db.delete(reviews);
    await db.delete(messages);
    await db.delete(media);
    await db.delete(posts);
    await db.delete(projects);
    await db.delete(testimonials);
    await db.delete(services);
    await db.delete(skills);
    await db.delete(categories);
    await db.delete(siteSettings);
    await db.delete(users);
    console.log("All existing data deleted successfully!");

    // ==================== USERS ====================
    await db.insert(users).values([
      {
        username: "admin",
        password: await hashPassword("admin123"),
        name: "Loi Developer",
        email: "admin@loideveloper.com",
        role: "Super Admin",
        status: "Active",
        avatar: "https://github.com/shadcn.png"
      },
      {
        username: "editor",
        password: await hashPassword("editor123"),
        name: "Sarah Editor",
        email: "sarah@loideveloper.com",
        role: "Editor",
        status: "Active",
        avatar: null
      },
      {
        username: "moderator",
        password: await hashPassword("mod123"),
        name: "John Moderator",
        email: "john@loideveloper.com",
        role: "Moderator",
        status: "Active",
        avatar: null
      },
      {
        username: "subscriber",
        password: await hashPassword("sub123"),
        name: "Alice User",
        email: "alice@example.com",
        role: "Subscriber",
        status: "Active",
        avatar: null
      }
    ]);
    console.log("Users seeded");

    // ==================== CATEGORIES ====================
    await db.insert(categories).values([
      // Project Categories
      { name: "Full-stack", slug: "full-stack", type: "project", description: "Full-stack web applications combining frontend and backend" },
      { name: "Frontend", slug: "frontend", type: "project", description: "Client-side web applications and interfaces" },
      { name: "Backend", slug: "backend", type: "project", description: "Server-side applications and APIs" },
      { name: "Mobile", slug: "mobile", type: "project", description: "iOS and Android mobile applications" },
      { name: "Design", slug: "design", type: "project", description: "UI/UX design and prototyping projects" },
      { name: "DevOps", slug: "devops", type: "project", description: "Infrastructure and deployment projects" },
      { name: "AI/ML", slug: "ai-ml", type: "project", description: "Artificial Intelligence and Machine Learning projects" },
      
      // Post Categories
      { name: "Web Development", slug: "web-development", type: "post", description: "Web development tutorials and articles" },
      { name: "Mobile Development", slug: "mobile-development", type: "post", description: "Mobile app development guides" },
      { name: "Backend Development", slug: "backend-development", type: "post", description: "Backend and API development" },
      { name: "Frontend Development", slug: "frontend-development", type: "post", description: "Frontend technologies and frameworks" },
      { name: "DevOps & Cloud", slug: "devops-cloud", type: "post", description: "DevOps practices and cloud computing" },
      { name: "UI/UX Design", slug: "ui-ux-design", type: "post", description: "Design principles and best practices" },
      { name: "Career & Productivity", slug: "career-productivity", type: "post", description: "Career advice and productivity tips" },
      { name: "Tools & Resources", slug: "tools-resources", type: "post", description: "Development tools and resources" }
    ]);
    console.log("Categories seeded");

    // ==================== PROJECTS ====================
    await db.insert(projects).values([
      {
        title: "E-commerce Analytics Dashboard",
        category: "full-stack",
        image: "/uploads/images/project_screenshot_dashboard.png",
        description: "A comprehensive data analytics platform for e-commerce businesses with real-time visualization, sales tracking, inventory management, and customer insights. Built with modern tech stack for scalability and performance.",
        tech: ["React", "TypeScript", "D3.js", "Node.js", "PostgreSQL", "Redis", "Docker"],
        link: "https://demo.analytics.com",
        github: "https://github.com/loi/analytics-dashboard",
        status: "Published",
        featured: true
      },
      {
        title: "Modern E-commerce Platform",
        category: "frontend",
        image: "/uploads/images/project_screenshot_ecommerce.png",
        description: "A cutting-edge shopping experience with headless CMS architecture, featuring advanced product filtering, wishlist, cart management, and seamless checkout process with multiple payment gateways.",
        tech: ["Next.js", "TypeScript", "Tailwind CSS", "Stripe", "Sanity CMS", "Vercel"],
        link: "https://demo.shop.com",
        github: "https://github.com/loi/ecommerce-platform",
        status: "Published",
        featured: true
      },
      {
        title: "Social Connect Mobile App",
        category: "mobile",
        image: "/uploads/images/project_screenshot_mobile_app.png",
        description: "Cross-platform social networking application for community engagement with real-time messaging, media sharing, story features, and advanced privacy controls.",
        tech: ["React Native", "TypeScript", "Firebase", "Redux Toolkit", "Socket.io"],
        link: "https://apps.apple.com/socialconnect",
        github: "https://github.com/loi/social-connect",
        status: "Published",
        featured: true
      },
      {
        title: "Task Management API",
        category: "backend",
        image: "/uploads/images/project_screenshot_dashboard.png",
        description: "RESTful API for task and project management with authentication, role-based access control, real-time updates, and comprehensive documentation.",
        tech: ["Node.js", "Express", "MongoDB", "JWT", "Swagger", "Jest"],
        link: "https://api.taskmanager.com",
        github: "https://github.com/loi/task-api",
        status: "Published",
        featured: false
      },
      {
        title: "Portfolio Design System",
        category: "design",
        image: "/uploads/images/project_screenshot_ecommerce.png",
        description: "Comprehensive design system with reusable components, design tokens, and guidelines for building consistent user interfaces across products.",
        tech: ["Figma", "Storybook", "React", "Tailwind CSS", "Design Tokens"],
        link: "https://design.portfolio.com",
        github: "https://github.com/loi/design-system",
        status: "Published",
        featured: false
      },
      {
        title: "AI Content Generator",
        category: "ai-ml",
        image: "/uploads/images/project_screenshot_mobile_app.png",
        description: "AI-powered content generation tool using GPT models for creating blog posts, social media content, and marketing copy with customizable templates.",
        tech: ["Python", "FastAPI", "OpenAI API", "React", "PostgreSQL", "Celery"],
        link: "https://contentai.com",
        github: "https://github.com/loi/ai-content-gen",
        status: "Published",
        featured: true
      },
      {
        title: "DevOps Automation Suite",
        category: "devops",
        image: "/uploads/images/project_screenshot_dashboard.png",
        description: "Automated CI/CD pipeline with infrastructure as code, monitoring, logging, and deployment automation for containerized applications.",
        tech: ["Docker", "Kubernetes", "Jenkins", "Terraform", "AWS", "Prometheus"],
        link: "https://devops.automation.com",
        github: "https://github.com/loi/devops-suite",
        status: "Published",
        featured: false
      },
      {
        title: "Real-time Chat Application",
        category: "full-stack",
        image: "/uploads/images/project_screenshot_ecommerce.png",
        description: "Scalable real-time chat application with group chats, file sharing, voice/video calls, and end-to-end encryption.",
        tech: ["React", "Socket.io", "Node.js", "MongoDB", "WebRTC", "Redis"],
        link: "https://chat.demo.com",
        github: "https://github.com/loi/realtime-chat",
        status: "Published",
        featured: false
      }
    ]);
    console.log("Projects seeded");

    // ==================== POSTS ====================
    await db.insert(posts).values([
      {
        title: "Getting Started with React 19: New Features and Best Practices",
        slug: "getting-started-react-19",
        content: `# React 19: A Complete Guide

React 19 introduces revolutionary features that change how we build web applications. In this comprehensive guide, we'll explore all the new capabilities and how to leverage them effectively.

## Key Features

### 1. Server Components
Server Components allow you to render components on the server, reducing client-side JavaScript and improving performance.

### 2. Improved Hydration
The new hydration system is more efficient and handles errors gracefully.

### 3. Enhanced Suspense
Better integration with data fetching and code splitting.

## Getting Started

\`\`\`jsx
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile />
    </Suspense>
  );
}
\`\`\`

## Best Practices

1. Use Server Components for static content
2. Implement proper error boundaries
3. Optimize bundle size with code splitting
4. Leverage concurrent features

## Conclusion

React 19 represents a major step forward in web development. Start exploring these features today!`,
        excerpt: "Explore the latest features in React 19 and learn how to build better web applications with improved performance and developer experience.",
        category: "Frontend Development",
        author: "Loi Developer",
        status: "Published",
        tags: ["React", "JavaScript", "Frontend", "Web Development"],
        featuredImage: "/uploads/images/tech_article_background_design.png",
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: "The Future of AI in Web Design: Trends and Predictions",
        slug: "future-ai-web-design",
        content: `# AI in Web Design: The Next Frontier

Artificial Intelligence is revolutionizing how we approach web design. Let's explore current trends and future predictions.

## Current AI Applications

1. **Automated Layout Generation** - AI tools can now create responsive layouts
2. **Color Scheme Suggestions** - Smart color palettes based on brand identity
3. **Content Optimization** - AI-powered content recommendations
4. **Accessibility Improvements** - Automated accessibility testing and fixes

## Emerging Trends

- Personalized user experiences
- Voice-driven interfaces
- Predictive UX
- Automated A/B testing

## Tools to Watch

- Figma AI plugins
- Adobe Sensei
- Framer AI
- ChatGPT for copywriting

## Conclusion

AI is augmenting, not replacing, designers. Embrace these tools to enhance your workflow.`,
        excerpt: "Discover how Artificial Intelligence is transforming web design and what the future holds for designers and developers.",
        category: "UI/UX Design",
        author: "Loi Developer",
        status: "Published",
        tags: ["AI", "Design", "Trends", "UX"],
        featuredImage: "/uploads/images/abstract_digital_particle_background.png",
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Optimizing Next.js Performance: Advanced Techniques",
        slug: "optimizing-nextjs-performance",
        content: `# Next.js Performance Optimization

Performance is crucial for user experience and SEO. Here are advanced techniques for optimizing your Next.js applications.

## Image Optimization

\`\`\`jsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  placeholder="blur"
/>
\`\`\`

## Code Splitting

Use dynamic imports for better bundle management:

\`\`\`jsx
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
\`\`\`

## Caching Strategies

Implement ISR and SSG for optimal performance.

## Monitoring

Use Vercel Analytics and Lighthouse for performance tracking.`,
        excerpt: "Learn advanced techniques for optimizing Next.js applications including image optimization, code splitting, and caching strategies.",
        category: "Web Development",
        author: "Loi Developer",
        status: "Published",
        tags: ["Next.js", "Performance", "Optimization", "React"],
        featuredImage: "/uploads/images/dev_blog_post_background.png",
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Building Scalable APIs with Node.js and PostgreSQL",
        slug: "building-scalable-apis-nodejs",
        content: `# Scalable API Development Guide

Learn how to build production-ready APIs that can handle millions of requests.

## Architecture

- Layered architecture (Routes → Controllers → Services → Repository)
- Dependency injection
- Error handling middleware
- Request validation

## Database Optimization

- Connection pooling
- Query optimization
- Indexing strategies
- Caching with Redis

## Security

- JWT authentication
- Rate limiting
- Input validation
- SQL injection prevention

## Deployment

- Docker containerization
- CI/CD pipelines
- Load balancing
- Monitoring and logging`,
        excerpt: "A comprehensive guide to building production-ready, scalable APIs using Node.js and PostgreSQL with best practices.",
        category: "Backend Development",
        author: "Loi Developer",
        status: "Published",
        tags: ["Node.js", "PostgreSQL", "API", "Backend"],
        featuredImage: "/uploads/images/abstract_blog_article_background.png",
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        title: "TypeScript Best Practices for Large-Scale Applications",
        slug: "typescript-best-practices",
        content: `# TypeScript Best Practices

Master TypeScript for building maintainable large-scale applications.

## Type Safety

Use strict mode and avoid 'any' type.

## Utility Types

Leverage built-in utility types like Partial, Pick, Omit, etc.

## Generic Types

Create reusable, type-safe components.

## Module Organization

Structure your codebase for scalability.`,
        excerpt: "Essential TypeScript best practices for building maintainable and scalable applications with proper type safety.",
        category: "Web Development",
        author: "Sarah Editor",
        status: "Draft",
        tags: ["TypeScript", "JavaScript", "Best Practices"],
        featuredImage: null,
        publishedAt: null
      },
      {
        title: "Mastering Tailwind CSS: Tips and Tricks",
        slug: "mastering-tailwind-css",
        content: `# Tailwind CSS Advanced Guide

Take your Tailwind skills to the next level.

## Custom Configuration

Extend Tailwind with custom colors, spacing, and utilities.

## Component Patterns

Build reusable component patterns.

## Performance

Optimize bundle size with PurgeCSS.

## Dark Mode

Implement elegant dark mode switching.`,
        excerpt: "Advanced tips and tricks for mastering Tailwind CSS including custom configurations and performance optimization.",
        category: "Frontend Development",
        author: "Loi Developer",
        status: "Published",
        tags: ["Tailwind CSS", "CSS", "Frontend", "Design"],
        featuredImage: "/uploads/images/tech_article_background_design.png",
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        title: "DevOps Fundamentals: CI/CD Pipeline Setup",
        slug: "devops-cicd-pipeline",
        content: `# CI/CD Pipeline Setup Guide

Learn to automate your deployment process.

## Continuous Integration

- Automated testing
- Code quality checks
- Build automation

## Continuous Deployment

- Staging environments
- Blue-green deployments
- Rollback strategies

## Tools

- GitHub Actions
- Jenkins
- CircleCI
- GitLab CI`,
        excerpt: "Complete guide to setting up CI/CD pipelines for automated testing and deployment with modern DevOps tools.",
        category: "DevOps & Cloud",
        author: "Loi Developer",
        status: "Published",
        tags: ["DevOps", "CI/CD", "Automation", "Docker"],
        featuredImage: "/uploads/images/abstract_digital_particle_background.png",
        publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Career Growth for Developers: A Practical Guide",
        slug: "developer-career-growth",
        content: `# Developer Career Growth

Strategies for advancing your development career.

## Skill Development

- Learn new technologies
- Build side projects
- Contribute to open source

## Networking

- Attend conferences
- Join communities
- Build your brand

## Interview Preparation

- System design
- Algorithm practice
- Portfolio building`,
        excerpt: "Practical strategies for advancing your career as a developer including skill development and networking tips.",
        category: "Career & Productivity",
        author: "Sarah Editor",
        status: "Published",
        tags: ["Career", "Professional Development", "Tips"],
        featuredImage: null,
        publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log("Posts seeded");

    // ==================== SKILLS ====================
    await db.insert(skills).values([
      // Frontend
      { name: "React", category: "Frontend", level: 95, icon: "react", order: 1 },
      { name: "Next.js", category: "Frontend", level: 92, icon: "nextjs", order: 2 },
      { name: "Vue.js", category: "Frontend", level: 85, icon: "vue", order: 3 },
      { name: "Tailwind CSS", category: "Frontend", level: 93, icon: "tailwind", order: 4 },
      { name: "Sass/SCSS", category: "Frontend", level: 88, icon: "sass", order: 5 },
      
      // Languages
      { name: "TypeScript", category: "Languages", level: 94, icon: "typescript", order: 6 },
      { name: "JavaScript", category: "Languages", level: 96, icon: "javascript", order: 7 },
      { name: "Python", category: "Languages", level: 82, icon: "python", order: 8 },
      { name: "Go", category: "Languages", level: 75, icon: "go", order: 9 },
      
      // Backend
      { name: "Node.js", category: "Backend", level: 90, icon: "nodejs", order: 10 },
      { name: "Express.js", category: "Backend", level: 89, icon: "express", order: 11 },
      { name: "NestJS", category: "Backend", level: 80, icon: "nestjs", order: 12 },
      { name: "GraphQL", category: "Backend", level: 78, icon: "graphql", order: 13 },
      
      // Database
      { name: "PostgreSQL", category: "Database", level: 87, icon: "postgresql", order: 14 },
      { name: "MongoDB", category: "Database", level: 85, icon: "mongodb", order: 15 },
      { name: "Redis", category: "Database", level: 80, icon: "redis", order: 16 },
      { name: "MySQL", category: "Database", level: 82, icon: "mysql", order: 17 },
      
      // DevOps
      { name: "Docker", category: "DevOps", level: 84, icon: "docker", order: 18 },
      { name: "Kubernetes", category: "DevOps", level: 70, icon: "kubernetes", order: 19 },
      { name: "CI/CD", category: "DevOps", level: 81, icon: "cicd", order: 20 },
      { name: "GitHub Actions", category: "DevOps", level: 85, icon: "github", order: 21 },
      
      // Cloud
      { name: "AWS", category: "Cloud", level: 78, icon: "aws", order: 22 },
      { name: "Vercel", category: "Cloud", level: 90, icon: "vercel", order: 23 },
      { name: "Firebase", category: "Cloud", level: 83, icon: "firebase", order: 24 },
      
      // Tools
      { name: "Git", category: "Tools", level: 92, icon: "git", order: 25 },
      { name: "VS Code", category: "Tools", level: 95, icon: "vscode", order: 26 },
      { name: "Figma", category: "Tools", level: 80, icon: "figma", order: 27 }
    ]);
    console.log("Skills seeded");

    // ==================== SERVICES ====================
    await db.insert(services).values([
      {
        title: "Full-Stack Web Development",
        description: "End-to-end web application development with modern technologies, from database design to deployment and maintenance.",
        icon: "code",
        features: [
          "React/Next.js Frontend Development",
          "Node.js/Express Backend APIs",
          "Database Design & Optimization",
          "RESTful & GraphQL APIs",
          "Authentication & Authorization",
          "Third-party Integrations"
        ],
        price: "From $3,000",
        order: 1,
        active: true
      },
      {
        title: "Mobile App Development",
        description: "Native and cross-platform mobile applications for iOS and Android with seamless user experience.",
        icon: "smartphone",
        features: [
          "React Native Development",
          "iOS & Android Native Apps",
          "App Store & Play Store Publishing",
          "Push Notifications",
          "Offline Functionality",
          "App Maintenance & Updates"
        ],
        price: "From $5,000",
        order: 2,
        active: true
      },
      {
        title: "UI/UX Design Services",
        description: "User-centered design solutions that combine aesthetics with functionality for optimal user experience.",
        icon: "palette",
        features: [
          "User Research & Analysis",
          "Wireframing & Prototyping",
          "Design Systems Creation",
          "Responsive Web Design",
          "Usability Testing",
          "Brand Identity Design"
        ],
        price: "From $1,500",
        order: 3,
        active: true
      },
      {
        title: "E-commerce Solutions",
        description: "Complete e-commerce platforms with payment integration, inventory management, and analytics.",
        icon: "shopping-cart",
        features: [
          "Custom Online Stores",
          "Payment Gateway Integration",
          "Inventory Management",
          "Order Processing System",
          "Analytics & Reporting",
          "SEO Optimization"
        ],
        price: "From $4,000",
        order: 4,
        active: true
      },
      {
        title: "API Development & Integration",
        description: "Robust RESTful and GraphQL APIs with comprehensive documentation and third-party integrations.",
        icon: "link",
        features: [
          "RESTful API Development",
          "GraphQL Implementation",
          "API Documentation",
          "Third-party API Integration",
          "Webhook Implementation",
          "API Security & Rate Limiting"
        ],
        price: "From $2,500",
        order: 5,
        active: true
      },
      {
        title: "DevOps & Cloud Services",
        description: "Infrastructure setup, CI/CD pipelines, and cloud deployment for scalable applications.",
        icon: "cloud",
        features: [
          "Docker Containerization",
          "CI/CD Pipeline Setup",
          "AWS/GCP/Azure Deployment",
          "Server Configuration",
          "Monitoring & Logging",
          "Performance Optimization"
        ],
        price: "From $2,000",
        order: 6,
        active: true
      },
      {
        title: "Technical Consulting",
        description: "Expert advice on technology stack, architecture decisions, and best practices for your projects.",
        icon: "lightbulb",
        features: [
          "Technology Stack Selection",
          "Architecture Design",
          "Code Review & Audit",
          "Performance Analysis",
          "Security Assessment",
          "Team Training"
        ],
        price: "From $150/hour",
        order: 7,
        active: true
      },
      {
        title: "Maintenance & Support",
        description: "Ongoing maintenance, bug fixes, and feature updates to keep your applications running smoothly.",
        icon: "wrench",
        features: [
          "Bug Fixes & Updates",
          "Performance Monitoring",
          "Security Patches",
          "Feature Enhancements",
          "24/7 Technical Support",
          "Monthly Reports"
        ],
        price: "From $500/month",
        order: 8,
        active: true
      }
    ]);
    console.log("Services seeded");

    // ==================== TESTIMONIALS ====================
    await db.insert(testimonials).values([
      {
        name: "John Smith",
        role: "CEO",
        company: "TechCorp Solutions",
        content: "Loi delivered exceptional work on our enterprise web application. His attention to detail, technical expertise, and ability to understand complex business requirements exceeded our expectations. The project was delivered on time and within budget.",
        avatar: null,
        rating: 5,
        featured: true,
        active: true
      },
      {
        name: "Sarah Johnson",
        role: "Product Manager",
        company: "StartupXYZ",
        content: "Working with Loi was a fantastic experience from start to finish. He understood our vision perfectly and translated it into a beautiful, functional product. His communication skills and proactive approach made the entire development process smooth and enjoyable.",
        avatar: null,
        rating: 5,
        featured: true,
        active: true
      },
      {
        name: "Michael Chen",
        role: "CTO",
        company: "InnovateTech",
        content: "I highly recommend Loi for any development project. He's professional, responsive, and delivers high-quality code. His expertise in React and Node.js helped us build a scalable platform that handles thousands of users seamlessly.",
        avatar: null,
        rating: 5,
        featured: true,
        active: true
      },
      {
        name: "Emily Rodriguez",
        role: "Founder",
        company: "DesignHub",
        content: "Loi transformed our outdated website into a modern, responsive platform. His UI/UX skills are outstanding, and he provided valuable insights throughout the project. Our conversion rate increased by 40% after the redesign!",
        avatar: null,
        rating: 5,
        featured: false,
        active: true
      },
      {
        name: "David Wilson",
        role: "Marketing Director",
        company: "GrowthLabs",
        content: "The mobile app Loi developed for us has been a game-changer for our business. It's intuitive, fast, and our customers love it. He also provided excellent post-launch support and helped us implement new features smoothly.",
        avatar: null,
        rating: 5,
        featured: false,
        active: true
      },
      {
        name: "Lisa Anderson",
        role: "VP of Engineering",
        company: "DataFlow Inc",
        content: "Loi's expertise in backend development and API design is impressive. He built a robust, scalable API infrastructure that powers our entire platform. His code quality and documentation are top-notch.",
        avatar: null,
        rating: 5,
        featured: false,
        active: true
      }
    ]);
    console.log("Testimonials seeded");

    // ==================== SITE SETTINGS ====================
    await db.insert(siteSettings).values([
      // Site Information
      { key: "siteTitle", value: "Loi Developer - Full-stack Creative" },
      { key: "tagline", value: "Building digital experiences with code." },
      { key: "contactEmail", value: "loideveloper@example.com" },
      { key: "maintenanceMode", value: false },
      
      // Hero Section
      { key: "heroTitle", value: "Hello, I'm Loi Developer" },
      { key: "heroSubtitle", value: "Full-stack Developer | UI/UX Enthusiast | Creative Thinker" },
      { key: "heroCTA", value: "View My Work" },
      { key: "cvFileUrl", value: "" },
      
      // About Section  
      { key: "aboutTitle", value: "About Me" },
      { key: "aboutSubtitle", value: "Full-stack Developer based in Vietnam" },
      { key: "aboutDescription", value: "I'm a passionate full-stack developer with expertise in building modern web applications. With years of experience in React, Node.js, and cloud technologies, I create digital experiences that combine beautiful design with robust functionality." },
      { key: "aboutDescription2", value: "My philosophy is simple: Code with passion, build with purpose. Whether it's a complex backend system or a pixel-perfect frontend interface, I strive for excellence in every line of code." },
      { key: "aboutImage", value: "" },
      { key: "aboutName", value: "Nguyen Thanh Loi" },
      { key: "aboutLocation", value: "Ho Chi Minh City" },
      { key: "aboutFreelance", value: "Available" },
      
      // Contact Section
      { key: "contactTitle", value: "Let's Talk" },
      { key: "contactSubtitle", value: "Have a project in mind or just want to say hi? I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions." },
      { key: "contactPhone", value: "+84 123 456 789" },
      { key: "contactAddress", value: "Ho Chi Minh City, Vietnam" },
      
      // Social Links
      { key: "socialFacebook", value: "" },
      { key: "socialTwitter", value: "" },
      { key: "socialInstagram", value: "" },
      { key: "socialLinkedin", value: "" },
      { key: "socialGithub", value: "" },
      { key: "socialYoutube", value: "" },
      
      // Footer
      { key: "footerText", value: "Crafted with love & countless cups of coffee" },
      { key: "footerCopyright", value: "2024 Loi Developer. All rights reserved." }
    ]);
    console.log("Site settings seeded");

    // ==================== COMMENTS ====================
    await db.insert(comments).values([
      // Comments on Post 1 (React 19)
      {
        authorName: "David Miller",
        authorEmail: "david@example.com",
        content: "Great article! Very helpful for understanding React 19 features. The code examples are clear and well-explained.",
        postId: 1,
        status: "Approved",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        authorName: "Emma Watson",
        authorEmail: "emma@example.com",
        content: "Thanks for this comprehensive guide! I've been waiting for a good React 19 tutorial.",
        postId: 1,
        status: "Approved",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        authorName: "Tom Wilson",
        authorEmail: "tom@example.com",
        content: "This is exactly what I was looking for. Can you write more about Server Components?",
        postId: 1,
        status: "Pending",
        createdAt: new Date()
      },
      
      // Comments on Post 2 (AI in Web Design)
      {
        authorName: "Sophie Chen",
        authorEmail: "sophie@example.com",
        content: "Fascinating insights into AI's role in design. I'm excited about the future!",
        postId: 2,
        status: "Approved",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        authorName: "Mark Johnson",
        authorEmail: "mark@example.com",
        content: "As a designer, I find this both exciting and slightly concerning. Great balanced perspective!",
        postId: 2,
        status: "Approved",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      
      // Comments on Projects
      {
        authorName: "Lisa Chen",
        authorEmail: "lisa@example.com",
        content: "I love the Analytics Dashboard project! The UI is very clean and the data visualization is impressive.",
        projectId: 1,
        status: "Approved",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        authorName: "Alex Turner",
        authorEmail: "alex@example.com",
        content: "The e-commerce platform looks amazing! How long did it take to build?",
        projectId: 2,
        status: "Approved",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        authorName: "Rachel Green",
        authorEmail: "rachel@example.com",
        content: "Great mobile app! The UI is very intuitive and smooth.",
        projectId: 3,
        status: "Pending",
        createdAt: new Date()
      }
    ]);
    console.log("Comments seeded");

    // ==================== REVIEWS ====================
    await db.insert(reviews).values([
      {
        authorName: "Alex Johnson",
        authorEmail: "alex@example.com",
        content: "Excellent work on the Analytics Dashboard! Very professional and well-documented code. The performance is outstanding even with large datasets.",
        projectId: 1,
        rating: 5,
        status: "Approved",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        authorName: "Maria Garcia",
        authorEmail: "maria@example.com",
        content: "The e-commerce platform is beautifully designed. Love the user experience and the checkout flow is seamless!",
        projectId: 2,
        rating: 5,
        status: "Approved",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        authorName: "James Lee",
        authorEmail: "james@example.com",
        content: "Good project overall, but I think the mobile app could use some improvements in performance on older devices.",
        projectId: 3,
        rating: 4,
        status: "Approved",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        authorName: "Christina Park",
        authorEmail: "christina@example.com",
        content: "The Task Management API is exactly what we needed. Clean architecture and great documentation!",
        projectId: 4,
        rating: 5,
        status: "Approved",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        authorName: "Robert Brown",
        authorEmail: "robert@example.com",
        content: "Impressive design system! It has significantly improved our development workflow.",
        projectId: 5,
        rating: 5,
        status: "Pending",
        createdAt: new Date()
      }
    ]);
    console.log("Reviews seeded");

    // ==================== MESSAGES ====================
    await db.insert(messages).values([
      {
        sender: "Jennifer Martinez",
        email: "jennifer@techstartup.com",
        subject: "Project Inquiry - E-commerce Platform",
        message: "Hi Loi, I came across your portfolio and I'm very impressed with your work. We're looking to build an e-commerce platform for our startup. Would you be available for a consultation call next week?",
        tag: "Project Inquiry",
        read: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        sender: "Kevin Anderson",
        email: "kevin@designagency.com",
        subject: "Collaboration Opportunity",
        message: "Hello, our design agency is looking for a skilled full-stack developer to collaborate on client projects. Your expertise in React and Node.js would be a great fit. Let's discuss!",
        tag: "Collaboration",
        read: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        sender: "Amanda White",
        email: "amanda@nonprofit.org",
        subject: "Website Development for Non-profit",
        message: "We're a non-profit organization looking to rebuild our website. We have a limited budget but are interested in your services. Can we schedule a call?",
        tag: "Project Inquiry",
        read: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        sender: "Peter Thompson",
        email: "peter@example.com",
        subject: "Question about React Tutorial",
        message: "Hi Loi, I read your React 19 article and have a question about Server Components. Can you explain more about when to use them vs client components?",
        tag: "Question",
        read: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        sender: "Michelle Davis",
        email: "michelle@enterprise.com",
        subject: "Enterprise Application Development",
        message: "We're looking for a developer to build a complex enterprise application with real-time features. Your Analytics Dashboard project caught our attention. Interested in discussing this opportunity?",
        tag: "Project Inquiry",
        read: false,
        createdAt: new Date()
      }
    ]);
    console.log("Messages seeded");

    // ==================== ACTIVITY LOGS ====================
    await db.insert(activityLogs).values([
      {
        action: "User Loi Developer logged in",
        userId: 1,
        userName: "Loi Developer",
        type: "success",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        action: "Published new post: Getting Started with React 19",
        userId: 1,
        userName: "Loi Developer",
        type: "info",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        action: "Updated project: Analytics Dashboard",
        userId: 1,
        userName: "Loi Developer",
        type: "info",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        action: "User Sarah Editor logged in",
        userId: 2,
        userName: "Sarah Editor",
        type: "success",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        action: "Created new service: Technical Consulting",
        userId: 1,
        userName: "Loi Developer",
        type: "info",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        action: "Approved comment from David Miller",
        userId: 2,
        userName: "Sarah Editor",
        type: "success",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log("Activity logs seeded");

    // ==================== NOTIFICATIONS ====================
    await db.insert(notifications).values([
      {
        message: "New comment on your post 'Getting Started with React 19'",
        type: "comment",
        read: false,
        userId: 1,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        message: "New project inquiry from Jennifer Martinez",
        type: "message",
        read: false,
        userId: 1,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        message: "Your project 'Analytics Dashboard' received a 5-star review",
        type: "review",
        read: true,
        userId: 1,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        message: "System: Database backup completed successfully",
        type: "system",
        read: true,
        userId: 1,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        message: "New collaboration opportunity from Kevin Anderson",
        type: "message",
        read: false,
        userId: 1,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log("Notifications seeded");

    // ==================== MEDIA ====================
    await db.insert(media).values([
      {
        filename: "hero-image.jpg",
        originalName: "hero-image.jpg",
        mimeType: "image/jpeg",
        size: 245678,
        url: "/uploads/images/futuristic_3d_developer_avatar.png",
        alt: "Developer avatar",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        filename: "project-dashboard.png",
        originalName: "analytics-dashboard-screenshot.png",
        mimeType: "image/png",
        size: 512340,
        url: "/uploads/images/project_screenshot_dashboard.png",
        alt: "Analytics dashboard screenshot",
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      },
      {
        filename: "ecommerce-screenshot.png",
        originalName: "ecommerce-platform.png",
        mimeType: "image/png",
        size: 478920,
        url: "/uploads/images/project_screenshot_ecommerce.png",
        alt: "E-commerce platform screenshot",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        filename: "blog-background-1.png",
        originalName: "tech-article-background.png",
        mimeType: "image/png",
        size: 156789,
        url: "/uploads/images/tech_article_background_design.png",
        alt: "Blog post background",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log("Media seeded");

    console.log("Database seeding completed successfully!");
    console.log("\n=== LOGIN CREDENTIALS ===");
    console.log("Super Admin:");
    console.log("  Username: admin");
    console.log("  Password: admin123");
    console.log("\nEditor:");
    console.log("  Username: editor");
    console.log("  Password: editor123");
    console.log("\nModerator:");
    console.log("  Username: moderator");
    console.log("  Password: mod123");
    console.log("\nSubscriber:");
    console.log("  Username: subscriber");
    console.log("  Password: sub123");
    console.log("=========================\n");
    
  } catch (error) {
    console.error("Seeding error:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
