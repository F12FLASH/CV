import { db } from "./db";
import { users, projects, posts, skills, services, testimonials, siteSettings, comments, reviews } from "@shared/schema";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function seed() {
  console.log("Seeding database...");

  try {
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

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
        email: "sarah@example.com",
        role: "Editor",
        status: "Active",
        avatar: null
      }
    ]);
    console.log("Users seeded");

    await db.insert(projects).values([
      {
        title: "Analytics Dashboard",
        category: "full-stack",
        image: "/attached_assets/generated_images/project_screenshot_dashboard.png",
        description: "A comprehensive data analytics platform with real-time visualization.",
        tech: ["React", "D3.js", "Node.js", "PostgreSQL"],
        link: "#",
        github: "#",
        status: "Published",
        featured: true
      },
      {
        title: "E-commerce Platform",
        category: "frontend",
        image: "/attached_assets/generated_images/project_screenshot_ecommerce.png",
        description: "Modern shopping experience with headless architecture.",
        tech: ["Next.js", "Tailwind", "Stripe"],
        link: "#",
        github: "#",
        status: "Published",
        featured: true
      },
      {
        title: "Social Mobile App",
        category: "mobile",
        image: "/attached_assets/generated_images/project_screenshot_mobile_app.png",
        description: "React Native application for community engagement.",
        tech: ["React Native", "Firebase", "Redux"],
        link: "#",
        github: "#",
        status: "Published",
        featured: false
      }
    ]);
    console.log("Projects seeded");

    await db.insert(posts).values([
      {
        title: "Getting Started with React 19",
        slug: "getting-started-react-19",
        content: "React 19 introduces exciting new features...",
        excerpt: "Learn about the latest features in React 19",
        category: "Development",
        author: "Loi Developer",
        status: "Published",
        tags: ["React", "JavaScript", "Frontend"],
        publishedAt: new Date()
      },
      {
        title: "The Future of AI in Web Design",
        slug: "future-ai-web-design",
        content: "Artificial Intelligence is transforming web design...",
        excerpt: "Explore how AI is changing web design",
        category: "Design",
        author: "Loi Developer",
        status: "Published",
        tags: ["AI", "Design", "Trends"],
        publishedAt: new Date()
      },
      {
        title: "Optimizing Next.js Performance",
        slug: "optimizing-nextjs-performance",
        content: "Performance optimization techniques for Next.js applications...",
        excerpt: "Tips for faster Next.js apps",
        category: "Development",
        author: "Loi Developer",
        status: "Draft",
        tags: ["Next.js", "Performance", "Optimization"]
      }
    ]);
    console.log("Posts seeded");

    await db.insert(skills).values([
      { name: "React", category: "Frontend", level: 95, icon: "react", order: 1 },
      { name: "TypeScript", category: "Languages", level: 90, icon: "typescript", order: 2 },
      { name: "Node.js", category: "Backend", level: 88, icon: "nodejs", order: 3 },
      { name: "PostgreSQL", category: "Database", level: 85, icon: "postgresql", order: 4 },
      { name: "Tailwind CSS", category: "Frontend", level: 92, icon: "tailwind", order: 5 },
      { name: "Python", category: "Languages", level: 80, icon: "python", order: 6 },
      { name: "Docker", category: "DevOps", level: 75, icon: "docker", order: 7 },
      { name: "AWS", category: "Cloud", level: 70, icon: "aws", order: 8 }
    ]);
    console.log("Skills seeded");

    await db.insert(services).values([
      {
        title: "Web Development",
        description: "Full-stack web development with modern technologies",
        icon: "code",
        features: ["React/Next.js", "Node.js/Express", "Database Design", "API Development"],
        price: "From $2,000",
        order: 1,
        active: true
      },
      {
        title: "Mobile App Development",
        description: "Cross-platform mobile applications",
        icon: "smartphone",
        features: ["React Native", "iOS & Android", "App Store Publishing", "Maintenance"],
        price: "From $5,000",
        order: 2,
        active: true
      },
      {
        title: "UI/UX Design",
        description: "User-centered design solutions",
        icon: "palette",
        features: ["User Research", "Wireframing", "Prototyping", "Design Systems"],
        price: "From $1,500",
        order: 3,
        active: true
      }
    ]);
    console.log("Services seeded");

    await db.insert(testimonials).values([
      {
        name: "John Smith",
        role: "CEO",
        company: "TechCorp",
        content: "Loi delivered exceptional work on our web application. His attention to detail and technical expertise exceeded our expectations.",
        avatar: null,
        rating: 5,
        featured: true,
        active: true
      },
      {
        name: "Sarah Johnson",
        role: "Product Manager",
        company: "StartupXYZ",
        content: "Working with Loi was a fantastic experience. He understood our vision and translated it into a beautiful, functional product.",
        avatar: null,
        rating: 5,
        featured: true,
        active: true
      },
      {
        name: "Michael Chen",
        role: "CTO",
        company: "InnovateTech",
        content: "Highly recommend Loi for any development project. Professional, responsive, and delivers high-quality code.",
        avatar: null,
        rating: 5,
        featured: false,
        active: true
      }
    ]);
    console.log("Testimonials seeded");

    await db.insert(siteSettings).values([
      { key: "siteTitle", value: "Loi Developer - Full-stack Creative" },
      { key: "tagline", value: "Building digital experiences with code." },
      { key: "contactEmail", value: "loideveloper@example.com" },
      { key: "maintenanceMode", value: false }
    ]);
    console.log("Site settings seeded");

    await db.insert(comments).values([
      {
        authorName: "David Miller",
        authorEmail: "david@example.com",
        content: "Great article! Very helpful for understanding React 19 features.",
        postId: 1,
        status: "Approved",
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        authorName: "Lisa Chen",
        authorEmail: "lisa@example.com",
        content: "I love the Analytics Dashboard project! The UI is very clean.",
        projectId: 1,
        status: "Approved",
        isRead: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        authorName: "Tom Wilson",
        authorEmail: "tom@example.com",
        content: "This is exactly what I was looking for. Thanks for sharing!",
        postId: 1,
        status: "Pending",
        isRead: false,
        createdAt: new Date()
      },
      {
        authorName: "Emma Brown",
        authorEmail: "emma@example.com",
        content: "Would love to see more tutorials like this.",
        postId: 2,
        status: "Pending",
        isRead: false,
        createdAt: new Date()
      }
    ]);
    console.log("Comments seeded");

    await db.insert(reviews).values([
      {
        authorName: "Alex Johnson",
        authorEmail: "alex@example.com",
        content: "Excellent work on this project! Very professional and well-documented code.",
        projectId: 1,
        rating: 5,
        status: "Approved",
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        authorName: "Maria Garcia",
        authorEmail: "maria@example.com",
        content: "The e-commerce platform is beautifully designed. Love the user experience!",
        projectId: 2,
        rating: 5,
        status: "Approved",
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        authorName: "James Lee",
        authorEmail: "james@example.com",
        content: "Good project but could use some improvements in mobile responsiveness.",
        projectId: 3,
        rating: 4,
        status: "Pending",
        isRead: false,
        createdAt: new Date()
      }
    ]);
    console.log("Reviews seeded");

    console.log("Database seeding completed!");
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
