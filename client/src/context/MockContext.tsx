import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import dashboardImg from "@assets/generated_images/project_screenshot_dashboard.png";
import ecommerceImg from "@assets/generated_images/project_screenshot_ecommerce.png";
import mobileImg from "@assets/generated_images/project_screenshot_mobile_app.png";

// Types
export interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  tech: string[];
  link: string;
  github: string;
  status: "Published" | "Draft" | "Archived";
  date: string;
  views: number;
}

export interface Message {
  id: number;
  sender: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
  tag: string;
}

interface MockContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  projects: Project[];
  messages: Message[];
  addProject: (project: Omit<Project, "id" | "views" | "date">) => void;
  deleteProject: (id: number) => void;
  addMessage: (msg: Omit<Message, "id" | "date" | "read" | "tag">) => void;
  markMessageRead: (id: number) => void;
  posts: Post[];
  addPost: (post: Omit<Post, "id" | "views" | "date">) => void;
  deletePost: (id: number) => void;
  users: User[];
  addUser: (user: Omit<User, "id" | "lastActive">) => void;
  deleteUser: (id: number) => void;
}

export interface Post {
  id: number;
  title: string;
  category: string;
  author: string;
  status: "Published" | "Draft" | "Archived";
  date: string;
  views: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "Super Admin" | "Admin" | "Editor" | "Subscriber";
  status: "Active" | "Inactive";
  lastActive: string;
  avatar: string;
}

const MockContext = createContext<MockContextType | undefined>(undefined);

// Initial Data
const initialPosts: Post[] = [
  {
    id: 1,
    title: "Getting Started with React 19",
    category: "Development",
    author: "Loi Developer",
    status: "Published",
    date: "2024-03-20",
    views: 1542
  },
  {
    id: 2,
    title: "The Future of AI in Web Design",
    category: "Design",
    author: "Loi Developer",
    status: "Published",
    date: "2024-03-18",
    views: 980
  },
  {
    id: 3,
    title: "Optimizing Next.js Performance",
    category: "Development",
    author: "Loi Developer",
    status: "Draft",
    date: "2024-03-22",
    views: 0
  }
];

const initialUsers: User[] = [
  {
    id: 1,
    name: "Loi Developer",
    email: "admin@loideveloper.com",
    role: "Super Admin",
    status: "Active",
    lastActive: "Just now",
    avatar: "https://github.com/shadcn.png"
  },
  {
    id: 2,
    name: "Sarah Editor",
    email: "sarah@example.com",
    role: "Editor",
    status: "Active",
    lastActive: "2 hours ago",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 3,
    name: "John Guest",
    email: "john@example.com",
    role: "Subscriber",
    status: "Inactive",
    lastActive: "5 days ago",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80"
  }
];

const initialProjects: Project[] = [
  {
    id: 1,
    title: "Analytics Dashboard",
    category: "full-stack",
    image: dashboardImg,
    description: "A comprehensive data analytics platform with real-time visualization.",
    tech: ["React", "D3.js", "Node.js", "PostgreSQL"],
    link: "#",
    github: "#",
    status: "Published",
    date: "2024-03-15",
    views: 1234
  },
  {
    id: 2,
    title: "E-commerce Platform",
    category: "frontend",
    image: ecommerceImg,
    description: "Modern shopping experience with headless architecture.",
    tech: ["Next.js", "Tailwind", "Stripe"],
    link: "#",
    github: "#",
    status: "Published",
    date: "2024-03-10",
    views: 856
  },
  {
    id: 3,
    title: "Social Mobile App",
    category: "mobile",
    image: mobileImg,
    description: "React Native application for community engagement.",
    tech: ["React Native", "Firebase", "Redux"],
    link: "#",
    github: "#",
    status: "Published",
    date: "2024-02-28",
    views: 2341
  },
];

const initialMessages: Message[] = [
  {
    id: 1,
    sender: "Sarah Wilson",
    email: "sarah@designstudio.com",
    subject: "Project Collaboration Inquiry",
    message: "Hi Loi, I came across your portfolio and I'm really impressed with your work...",
    date: "10:42 AM",
    read: false,
    tag: "Work"
  }
];

export function MockProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const { toast } = useToast();

  // Load from localStorage on mount to simulate persistence
  useEffect(() => {
    const savedAuth = localStorage.getItem("isAuthenticated");
    if (savedAuth === "true") setIsAuthenticated(true);

    const savedProjects = localStorage.getItem("projects");
    if (savedProjects) setProjects(JSON.parse(savedProjects));

    const savedMessages = localStorage.getItem("messages");
    if (savedMessages) setMessages(JSON.parse(savedMessages));

    const savedPosts = localStorage.getItem("posts");
    if (savedPosts) setPosts(JSON.parse(savedPosts));

    const savedUsers = localStorage.getItem("users");
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("isAuthenticated", String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  const addProject = (newProject: Omit<Project, "id" | "views" | "date">) => {
    const project: Project = {
      ...newProject,
      id: Date.now(),
      views: 0,
      date: new Date().toISOString().split('T')[0]
    };
    setProjects([project, ...projects]);
    toast({ title: "Project Added", description: `${newProject.title} has been created.` });
  };

  const deleteProject = (id: number) => {
    setProjects(projects.filter(p => p.id !== id));
    toast({ title: "Project Deleted", description: "The project has been removed." });
  };

  const addMessage = (msg: Omit<Message, "id" | "date" | "read" | "tag">) => {
    const newMessage: Message = {
      ...msg,
      id: Date.now(),
      date: "Just now",
      read: false,
      tag: "New"
    };
    setMessages([newMessage, ...messages]);
  };

  const markMessageRead = (id: number) => {
    setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const addPost = (newPost: Omit<Post, "id" | "views" | "date">) => {
    const post: Post = {
      ...newPost,
      id: Date.now(),
      views: 0,
      date: new Date().toISOString().split('T')[0]
    };
    setPosts([post, ...posts]);
    toast({ title: "Post Created", description: `${newPost.title} has been saved.` });
  };

  const deletePost = (id: number) => {
    setPosts(posts.filter(p => p.id !== id));
    toast({ title: "Post Deleted", description: "The post has been moved to trash." });
  };

  const addUser = (newUser: Omit<User, "id" | "lastActive">) => {
    const user: User = {
      ...newUser,
      id: Date.now(),
      lastActive: "Never"
    };
    setUsers([user, ...users]);
    toast({ title: "User Added", description: `${newUser.name} has been invited.` });
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
    toast({ title: "User Removed", description: "User access has been revoked." });
  };

  return (
    <MockContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      projects, 
      messages, 
      addProject, 
      deleteProject, 
      addMessage,
      markMessageRead,
      posts,
      addPost,
      deletePost,
      users,
      addUser,
      deleteUser
    }}>
      {children}
    </MockContext.Provider>
  );
}

export const useMockData = () => {
  const context = useContext(MockContext);
  if (!context) throw new Error("useMockData must be used within a MockProvider");
  return context;
};
