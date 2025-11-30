import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Project {
  id: number;
  title: string;
  category: string;
  image: string | null;
  description: string | null;
  tech: string[];
  link: string | null;
  github: string | null;
  status: "Published" | "Draft" | "Archived";
  views: number;
  featured: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Message {
  id: number;
  sender: string;
  email: string;
  subject: string | null;
  message: string;
  tag: string | null;
  read: boolean;
  archived: boolean;
  createdAt: Date | null;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  category: string;
  author: string;
  status: "Published" | "Draft" | "Archived";
  views: number;
  featuredImage: string | null;
  tags: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
  publishedAt: Date | null;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: "Super Admin" | "Admin" | "Editor" | "Subscriber";
  status: "Active" | "Inactive";
  avatar: string | null;
  lastActive: Date | null;
  createdAt: Date | null;
}

export interface ActivityLog {
  id: number;
  action: string;
  userId: number | null;
  userName: string | null;
  type: "info" | "warning" | "success" | "error";
  metadata: any;
  createdAt: Date | null;
}

export interface Notification {
  id: number;
  message: string;
  type: "system" | "security" | "update";
  read: boolean;
  userId: number | null;
  createdAt: Date | null;
}

interface MockContextType {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => Promise<void>;
  updatePost: (id: number, post: Partial<Post>) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => Promise<void>;
  updateProject: (id: number, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  users: User[];
  addUser: (user: any) => Promise<void>;
  updateUser: (id: number, user: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  messages: Message[];
  markAsRead: (id: number) => Promise<void>;
  deleteMessage: (id: number) => Promise<void>;
  refetchMessages: () => void;
  activityLogs: ActivityLog[];
  notifications: Notification[];
  isLoading: boolean;
  refetchAll: () => void;
}

const MockContext = createContext<MockContextType | undefined>(undefined);

export function MockProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const verifySession = async () => {
      const savedAuth = localStorage.getItem("isAuthenticated");
      if (savedAuth === "true") {
        try {
          const user = await api.getCurrentUser();
          setIsAuthenticated(true);
          setCurrentUser(user);
          localStorage.setItem("currentUser", JSON.stringify(user));
        } catch (error) {
          localStorage.removeItem("isAuthenticated");
          localStorage.removeItem("currentUser");
          setIsAuthenticated(false);
          setCurrentUser(null);
        } finally {
          setIsCheckingAuth(false);
        }
      } else {
        setIsCheckingAuth(false);
      }
    };
    verifySession();
  }, []);

  const { data: projects = [], isLoading: projectsLoading, refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
    staleTime: 30000,
  });

  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['posts'],
    queryFn: () => api.getPosts(),
    staleTime: 30000,
  });

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
    staleTime: 30000,
    enabled: isAuthenticated,
  });

  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['messages'],
    queryFn: () => api.getMessages(),
    staleTime: 30000,
    enabled: isAuthenticated,
  });

  const { data: activityLogs = [], refetch: refetchActivityLogs } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: () => api.getActivityLogs(20),
    staleTime: 30000,
    enabled: isAuthenticated,
  });

  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
    staleTime: 30000,
    enabled: isAuthenticated,
  });

  const isLoading = projectsLoading || postsLoading || usersLoading || messagesLoading;

  const refetchAll = useCallback(() => {
    refetchProjects();
    refetchPosts();
    refetchUsers();
    refetchMessages();
    refetchActivityLogs();
    refetchNotifications();
  }, [refetchProjects, refetchPosts, refetchUsers, refetchMessages, refetchActivityLogs, refetchNotifications]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login(username, password);
      setIsAuthenticated(true);
      setCurrentUser(response.user);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentUser", JSON.stringify(response.user));
      toast({ title: "Login Successful", description: `Welcome back, ${response.user.name}!` });
      return true;
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout API error:", error);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser");
    toast({ title: "Logged Out", description: "You have been logged out successfully." });
  };

  const addPost = async (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => {
    try {
      await api.createPost(post);
      await refetchPosts();
      toast({ title: "Post Created", description: `${post.title} has been saved.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updatePost = async (id: number, post: Partial<Post>) => {
    try {
      await api.updatePost(id, post);
      await refetchPosts();
      toast({ title: "Post Updated", description: "Post has been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deletePost = async (id: number) => {
    try {
      await api.deletePost(id);
      await refetchPosts();
      toast({ title: "Post Deleted", description: "The post has been removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => {
    try {
      await api.createProject(project);
      await refetchProjects();
      toast({ title: "Project Added", description: `${project.title} has been created.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateProject = async (id: number, project: Partial<Project>) => {
    try {
      await api.updateProject(id, project);
      await refetchProjects();
      toast({ title: "Project Updated", description: "Project has been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteProject = async (id: number) => {
    try {
      await api.deleteProject(id);
      await refetchProjects();
      toast({ title: "Project Deleted", description: "The project has been removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addUser = async (user: any) => {
    try {
      await api.register(user);
      await refetchUsers();
      toast({ title: "User Added", description: `${user.name} has been invited.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateUser = async (id: number, user: Partial<User>) => {
    try {
      await api.updateUser(id, user);
      await refetchUsers();
      toast({ title: "User Updated", description: "User has been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await api.deleteUser(id);
      await refetchUsers();
      toast({ title: "User Removed", description: "User access has been revoked." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.markMessageAsRead(id);
      await refetchMessages();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteMessage = async (id: number) => {
    try {
      await api.deleteMessage(id);
      await refetchMessages();
      toast({ title: "Message Deleted", description: "The message has been removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <MockContext.Provider value={{
      isAuthenticated,
      isCheckingAuth,
      currentUser,
      login,
      logout,
      posts,
      addPost,
      updatePost,
      deletePost,
      projects,
      addProject,
      updateProject,
      deleteProject,
      users,
      addUser,
      updateUser,
      deleteUser,
      messages,
      markAsRead,
      deleteMessage,
      refetchMessages,
      activityLogs,
      notifications,
      isLoading,
      refetchAll
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