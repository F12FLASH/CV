export interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  totalPosts: number;
  publishedPosts: number;
  totalMessages: number;
  unreadMessages: number;
  totalUsers: number;
  totalComments: number;
  totalReviews: number;
  pendingReviews: number;
  totalViews: number;
}

export interface TrafficData {
  date: string;
  posts: number;
  projects: number;
  views: number;
}

export interface TopContent {
  title: string;
  path: string;
  views: number;
  type: "post" | "project";
}

export interface ContentStatusData {
  name: string;
  value: number;
  color: string;
}

export interface AnalyticsDayData {
  date: string;
  postViews: number;
  projectViews: number;
  totalViews: number;
}
