import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  posts, type Post, type InsertPost,
  pages, type Page, type InsertPage,
  skills, type Skill, type InsertSkill,
  services, type Service, type InsertService,
  testimonials, type Testimonial, type InsertTestimonial,
  messages, type Message, type InsertMessage,
  activityLogs, type ActivityLog, type InsertActivityLog,
  notifications, type Notification, type InsertNotification,
  siteSettings, type SiteSetting, type InsertSiteSetting,
  categories, type Category, type InsertCategory,
  media, type Media, type InsertMedia,
  comments, type Comment, type InsertComment,
  reviews, type Review, type InsertReview,
  securitySettings, type SecuritySetting, type InsertSecuritySetting,
  trustedDevices, type TrustedDevice, type InsertTrustedDevice,
  userSessions, type UserSession, type InsertUserSession,
  ipRules, type IpRule, type InsertIpRule,
  securityLogs, type SecurityLog, type InsertSecurityLog,
  homepageSections, type HomepageSection, type InsertHomepageSection,
  faqs, type FAQ, type InsertFAQ
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsernameOrEmail(credential: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Projects
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  getPublishedProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  incrementProjectViews(id: number): Promise<void>;

  // Posts
  getPost(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getAllPosts(): Promise<Post[]>;
  getPublishedPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  incrementPostViews(id: number): Promise<void>;

  // Pages
  getPage(id: number): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  getAllPages(): Promise<Page[]>;
  getPublishedPages(): Promise<Page[]>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: number): Promise<boolean>;
  incrementPageViews(id: number): Promise<void>;

  // Skills
  getSkill(id: number): Promise<Skill | undefined>;
  getAllSkills(): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;

  // Services
  getService(id: number): Promise<Service | undefined>;
  getAllServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  // Testimonials
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  getAllTestimonials(): Promise<Testimonial[]>;
  getActiveTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<boolean>;

  // Messages
  getMessage(id: number): Promise<Message | undefined>;
  getAllMessages(): Promise<Message[]>;
  getUnreadMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<boolean>;
  archiveMessage(id: number): Promise<boolean>;
  deleteMessage(id: number): Promise<boolean>;

  // Activity Logs
  getAllActivityLogs(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Notifications
  getAllNotifications(userId?: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;

  // Homepage Sections
  getAllHomepageSections(): Promise<HomepageSection[]>;
  getHomepageSectionByName(name: string): Promise<HomepageSection | undefined>;
  updateHomepageSection(name: string, section: Partial<InsertHomepageSection>): Promise<HomepageSection | undefined>;
  upsertHomepageSection(name: string, section: Partial<InsertHomepageSection>): Promise<HomepageSection>;

  // Site Settings
  getSetting(key: string): Promise<SiteSetting | undefined>;
  getAllSettings(): Promise<SiteSetting[]>;
  upsertSetting(key: string, value: any): Promise<SiteSetting>;

  // Categories
  getCategory(id: number): Promise<Category | undefined>;
  getCategoriesByType(type: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Media
  getMedia(id: number): Promise<Media | undefined>;
  getAllMedia(): Promise<Media[]>;
  createMedia(mediaItem: InsertMedia): Promise<Media>;
  deleteMedia(id: number): Promise<boolean>;

  // Comments
  getComment(id: number): Promise<Comment | undefined>;
  getAllComments(): Promise<Comment[]>;
  getCommentsByPost(postId: number): Promise<Comment[]>;
  getCommentsByProject(projectId: number): Promise<Comment[]>;
  getApprovedCommentsByPost(postId: number): Promise<Comment[]>;
  getApprovedCommentsByProject(projectId: number): Promise<Comment[]>;
  getPendingComments(): Promise<Comment[]>;
  getUnreadComments(): Promise<Comment[]>;
  getUnarchivedComments(): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<InsertComment>): Promise<Comment | undefined>;
  approveComment(id: number): Promise<boolean>;
  markCommentAsRead(id: number): Promise<boolean>;
  archiveComment(id: number): Promise<boolean>;
  deleteComment(id: number): Promise<boolean>;

  // Reviews
  getReview(id: number): Promise<Review | undefined>;
  getAllReviews(): Promise<Review[]>;
  getReviewsByProject(projectId: number): Promise<Review[]>;
  getApprovedReviewsByProject(projectId: number): Promise<Review[]>;
  getPendingReviews(): Promise<Review[]>;
  getUnreadReviews(): Promise<Review[]>;
  getUnarchivedReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review | undefined>;
  approveReview(id: number): Promise<boolean>;
  markReviewAsRead(id: number): Promise<boolean>;
  archiveReview(id: number): Promise<boolean>;
  deleteReview(id: number): Promise<boolean>;

  // System
  getSystemStats(): Promise<{
    databaseSize: string;
    tableStats: { name: string; count: number }[];
    serverUptime: number;
    lastCheck: Date;
    status: "Healthy" | "Warning" | "Error";
  }>;
  getActivityLogs(limit: number, offset: number): Promise<ActivityLog[]>;
  clearActivityLogs(): Promise<void>;

  // Security Settings
  getSecuritySetting(key: string): Promise<SecuritySetting | undefined>;
  getAllSecuritySettings(): Promise<SecuritySetting[]>;
  upsertSecuritySetting(key: string, value: any): Promise<SecuritySetting>;

  // Trusted Devices
  getTrustedDevice(id: number): Promise<TrustedDevice | undefined>;
  getTrustedDevicesByUser(userId: number): Promise<TrustedDevice[]>;
  createTrustedDevice(device: InsertTrustedDevice): Promise<TrustedDevice>;
  updateTrustedDevice(id: number, device: Partial<InsertTrustedDevice>): Promise<TrustedDevice | undefined>;
  deleteTrustedDevice(id: number): Promise<boolean>;

  // User Sessions
  getUserSession(id: number): Promise<UserSession | undefined>;
  getUserSessionBySessionId(sessionId: string): Promise<UserSession | undefined>;
  getActiveSessionsByUser(userId: number): Promise<UserSession[]>;
  getAllActiveSessions(): Promise<UserSession[]>;
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  updateUserSession(id: number, session: Partial<InsertUserSession>): Promise<UserSession | undefined>;
  terminateSession(id: number): Promise<boolean>;
  terminateAllUserSessions(userId: number): Promise<boolean>;
  terminateAllSessions(): Promise<boolean>;

  // IP Rules
  getIpRule(id: number): Promise<IpRule | undefined>;
  getIpRulesByType(type: string): Promise<IpRule[]>;
  getAllIpRules(): Promise<IpRule[]>;
  createIpRule(rule: InsertIpRule): Promise<IpRule>;
  deleteIpRule(id: number): Promise<boolean>;
  isIpWhitelisted(ip: string): Promise<boolean>;
  isIpBlacklisted(ip: string): Promise<boolean>;

  // Security Logs
  getSecurityLog(id: number): Promise<SecurityLog | undefined>;
  getSecurityLogsByType(eventType: string): Promise<SecurityLog[]>;
  getRecentSecurityLogs(limit?: number): Promise<SecurityLog[]>;
  createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog>;
  getSecurityStats(): Promise<{
    totalBlocked: number;
    totalAllowed: number;
    byEventType: { type: string; count: number }[];
  }>;

  // FAQs
  getFAQ(id: number): Promise<FAQ | undefined>;
  getAllFAQs(): Promise<FAQ[]>;
  getVisibleFAQs(): Promise<FAQ[]>;
  createFAQ(faq: InsertFAQ): Promise<FAQ>;
  updateFAQ(id: number, faq: Partial<InsertFAQ>): Promise<FAQ | undefined>;
  deleteFAQ(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsernameOrEmail(credential: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      sql`${users.username} = ${credential} OR ${users.email} = ${credential}`
    );
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Projects
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getPublishedProjects(): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.status, "Published")).orderBy(desc(projects.createdAt));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values({
      ...insertProject,
      tech: insertProject.tech ? [...insertProject.tech] : []
    }).returning();
    return project;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const updateData: any = { ...projectData, updatedAt: new Date() };
    if (projectData.tech) {
      updateData.tech = [...projectData.tech];
    }
    const [project] = await db.update(projects).set(updateData).where(eq(projects.id, id)).returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  async incrementProjectViews(id: number): Promise<void> {
    await db.update(projects).set({ views: sql`${projects.views} + 1` }).where(eq(projects.id, id));
  }

  // Posts
  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post || undefined;
  }

  async getAllPosts(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async getPublishedPosts(): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.status, "Published")).orderBy(desc(posts.publishedAt));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    let publishedAt = null;
    if (insertPost.publishedAt) {
      if (typeof insertPost.publishedAt === 'string') {
        const date = new Date(insertPost.publishedAt);
        publishedAt = isNaN(date.getTime()) ? null : date;
      } else if (insertPost.publishedAt instanceof Date) {
        publishedAt = insertPost.publishedAt;
      }
    }
    const [post] = await db.insert(posts).values({
      ...insertPost,
      tags: insertPost.tags ? [...insertPost.tags] : [],
      publishedAt
    }).returning();
    return post;
  }

  async updatePost(id: number, postData: Partial<InsertPost>): Promise<Post | undefined> {
    const updateData: any = { ...postData, updatedAt: new Date() };
    if (postData.tags) {
      updateData.tags = [...postData.tags];
    }
    if ('publishedAt' in updateData) {
      if (updateData.publishedAt === null || updateData.publishedAt === undefined) {
        updateData.publishedAt = null;
      } else if (typeof updateData.publishedAt === 'string') {
        const date = new Date(updateData.publishedAt);
        updateData.publishedAt = isNaN(date.getTime()) ? null : date;
      } else if (!(updateData.publishedAt instanceof Date)) {
        updateData.publishedAt = null;
      }
    }
    const [post] = await db.update(posts).set(updateData).where(eq(posts.id, id)).returning();
    return post || undefined;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    return result.length > 0;
  }

  async incrementPostViews(id: number): Promise<void> {
    await db.update(posts).set({ views: sql`${posts.views} + 1` }).where(eq(posts.id, id));
  }

  // Pages
  async getPage(id: number): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page || undefined;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page || undefined;
  }

  async getAllPages(): Promise<Page[]> {
    return await db.select().from(pages).orderBy(desc(pages.createdAt));
  }

  async getPublishedPages(): Promise<Page[]> {
    return await db.select().from(pages).where(eq(pages.status, "Published")).orderBy(desc(pages.publishedAt));
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    let publishedAt = null;
    if (insertPage.publishedAt) {
      if (typeof insertPage.publishedAt === 'string') {
        const date = new Date(insertPage.publishedAt);
        publishedAt = isNaN(date.getTime()) ? null : date;
      } else if (insertPage.publishedAt instanceof Date) {
        publishedAt = insertPage.publishedAt;
      }
    }
    const [page] = await db.insert(pages).values({
      ...insertPage,
      publishedAt
    }).returning();
    return page;
  }

  async updatePage(id: number, pageData: Partial<InsertPage>): Promise<Page | undefined> {
    const updateData: any = { ...pageData, updatedAt: new Date() };
    if ('publishedAt' in updateData) {
      if (updateData.publishedAt === null || updateData.publishedAt === undefined) {
        updateData.publishedAt = null;
      } else if (typeof updateData.publishedAt === 'string') {
        const date = new Date(updateData.publishedAt);
        updateData.publishedAt = isNaN(date.getTime()) ? null : date;
      } else if (!(updateData.publishedAt instanceof Date)) {
        updateData.publishedAt = null;
      }
    }
    const [page] = await db.update(pages).set(updateData).where(eq(pages.id, id)).returning();
    return page || undefined;
  }

  async deletePage(id: number): Promise<boolean> {
    const result = await db.delete(pages).where(eq(pages.id, id)).returning();
    return result.length > 0;
  }

  async incrementPageViews(id: number): Promise<void> {
    await db.update(pages).set({ views: sql`${pages.views} + 1` }).where(eq(pages.id, id));
  }

  // Skills
  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill || undefined;
  }

  async getAllSkills(): Promise<Skill[]> {
    return await db.select().from(skills).orderBy(asc(skills.order));
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [skill] = await db.insert(skills).values(insertSkill).returning();
    return skill;
  }

  async updateSkill(id: number, skillData: Partial<InsertSkill>): Promise<Skill | undefined> {
    const [skill] = await db.update(skills).set(skillData).where(eq(skills.id, id)).returning();
    return skill || undefined;
  }

  async deleteSkill(id: number): Promise<boolean> {
    const result = await db.delete(skills).where(eq(skills.id, id)).returning();
    return result.length > 0;
  }

  // Services
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(asc(services.order));
  }

  async getActiveServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.active, true)).orderBy(asc(services.order));
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values({
      ...insertService,
      features: insertService.features ? [...insertService.features] : []
    }).returning();
    return service;
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const updateData: any = { ...serviceData };
    if (serviceData.features) {
      updateData.features = [...serviceData.features];
    }
    const [service] = await db.update(services).set(updateData).where(eq(services.id, id)).returning();
    return service || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id)).returning();
    return result.length > 0;
  }

  // Testimonials
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, id));
    return testimonial || undefined;
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  }

  async getActiveTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).where(eq(testimonials.active, true)).orderBy(desc(testimonials.createdAt));
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db.insert(testimonials).values(insertTestimonial).returning();
    return testimonial;
  }

  async updateTestimonial(id: number, testimonialData: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const [testimonial] = await db.update(testimonials).set(testimonialData).where(eq(testimonials.id, id)).returning();
    return testimonial || undefined;
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    const result = await db.delete(testimonials).where(eq(testimonials.id, id)).returning();
    return result.length > 0;
  }

  // Messages
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getAllMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async getUnreadMessages(): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.read, false)).orderBy(desc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<boolean> {
    const result = await db.update(messages).set({ read: true }).where(eq(messages.id, id)).returning();
    return result.length > 0;
  }

  async archiveMessage(id: number): Promise<boolean> {
    const result = await db.update(messages).set({ archived: true }).where(eq(messages.id, id)).returning();
    return result.length > 0;
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id)).returning();
    return result.length > 0;
  }

  // Activity Logs
  async getAllActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db.insert(activityLogs).values(insertLog).returning();
    return log;
  }

  // Notifications
  async getAllNotifications(userId?: number): Promise<Notification[]> {
    if (userId) {
      return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    }
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db.update(notifications).set({ read: true }).where(eq(notifications.id, id)).returning();
    return result.length > 0;
  }

  // Site Settings
  async getSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting || undefined;
  }

  async getAllSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }

  async upsertSetting(key: string, value: any): Promise<SiteSetting> {
    const existing = await this.getSetting(key);
    if (existing) {
      const [setting] = await db.update(siteSettings).set({ value, updatedAt: new Date() }).where(eq(siteSettings.key, key)).returning();
      return setting;
    } else {
      const [setting] = await db.insert(siteSettings).values({ key, value }).returning();
      return setting;
    }
  }

  // Categories
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategoriesByType(type: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.type, type));
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db.update(categories).set(categoryData).where(eq(categories.id, id)).returning();
    return category || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }

  // Media
  async getMedia(id: number): Promise<Media | undefined> {
    const [mediaItem] = await db.select().from(media).where(eq(media.id, id));
    return mediaItem || undefined;
  }

  async getAllMedia(): Promise<Media[]> {
    return await db.select().from(media).orderBy(desc(media.createdAt));
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const [mediaItem] = await db.insert(media).values(insertMedia).returning();
    return mediaItem;
  }

  async deleteMedia(id: number): Promise<boolean> {
    const result = await db.delete(media).where(eq(media.id, id)).returning();
    return result.length > 0;
  }

  // Comments
  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment || undefined;
  }

  async getAllComments(): Promise<Comment[]> {
    return await db.select().from(comments).orderBy(desc(comments.createdAt));
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
  }

  async getCommentsByProject(projectId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.projectId, projectId)).orderBy(desc(comments.createdAt));
  }

  async getApprovedCommentsByPost(postId: number): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(and(eq(comments.postId, postId), eq(comments.status, "Approved")))
      .orderBy(desc(comments.createdAt));
  }

  async getApprovedCommentsByProject(projectId: number): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(and(eq(comments.projectId, projectId), eq(comments.status, "Approved")))
      .orderBy(desc(comments.createdAt));
  }

  async getPendingComments(): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.status, "Pending")).orderBy(desc(comments.createdAt));
  }

  async getUnreadComments(): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.read, false)).orderBy(desc(comments.createdAt));
  }

  async getUnarchivedComments(): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.archived, false)).orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  async updateComment(id: number, commentData: Partial<InsertComment>): Promise<Comment | undefined> {
    const [comment] = await db.update(comments).set(commentData).where(eq(comments.id, id)).returning();
    return comment || undefined;
  }

  async approveComment(id: number): Promise<boolean> {
    const result = await db.update(comments).set({ status: "Approved" }).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  async markCommentAsRead(id: number): Promise<boolean> {
    const result = await db.update(comments).set({ read: true }).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  async archiveComment(id: number): Promise<boolean> {
    const result = await db.update(comments).set({ archived: true }).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  // Reviews
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async getAllReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async getReviewsByProject(projectId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.projectId, projectId)).orderBy(desc(reviews.createdAt));
  }

  async getApprovedReviewsByProject(projectId: number): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(and(eq(reviews.projectId, projectId), eq(reviews.status, "Approved")))
      .orderBy(desc(reviews.createdAt));
  }

  async getPendingReviews(): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.status, "Pending")).orderBy(desc(reviews.createdAt));
  }

  async getUnreadReviews(): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.read, false)).orderBy(desc(reviews.createdAt));
  }

  async getUnarchivedReviews(): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.archived, false)).orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async updateReview(id: number, reviewData: Partial<InsertReview>): Promise<Review | undefined> {
    const [review] = await db.update(reviews).set(reviewData).where(eq(reviews.id, id)).returning();
    return review || undefined;
  }

  async approveReview(id: number): Promise<boolean> {
    const result = await db.update(reviews).set({ status: "Approved" }).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }

  async markReviewAsRead(id: number): Promise<boolean> {
    const result = await db.update(reviews).set({ read: true }).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }

  async archiveReview(id: number): Promise<boolean> {
    const result = await db.update(reviews).set({ archived: true }).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }

  async deleteReview(id: number): Promise<boolean> {
    const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }

  // System methods
  async getSystemStats(): Promise<{
    databaseSize: string;
    tableStats: { name: string; count: number }[];
    serverUptime: number;
    lastCheck: Date;
    status: "Healthy" | "Warning" | "Error";
  }> {
    try {
      const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [projectsCount] = await db.select({ count: sql<number>`count(*)` }).from(projects);
      const [postsCount] = await db.select({ count: sql<number>`count(*)` }).from(posts);
      const [skillsCount] = await db.select({ count: sql<number>`count(*)` }).from(skills);
      const [servicesCount] = await db.select({ count: sql<number>`count(*)` }).from(services);
      const [messagesCount] = await db.select({ count: sql<number>`count(*)` }).from(messages);
      const [testimonialsCount] = await db.select({ count: sql<number>`count(*)` }).from(testimonials);
      const [commentsCount] = await db.select({ count: sql<number>`count(*)` }).from(comments);
      const [reviewsCount] = await db.select({ count: sql<number>`count(*)` }).from(reviews);
      const [activityCount] = await db.select({ count: sql<number>`count(*)` }).from(activityLogs);

      const tableStats = [
        { name: "Users", count: Number(usersCount.count) },
        { name: "Projects", count: Number(projectsCount.count) },
        { name: "Posts", count: Number(postsCount.count) },
        { name: "Skills", count: Number(skillsCount.count) },
        { name: "Services", count: Number(servicesCount.count) },
        { name: "Messages", count: Number(messagesCount.count) },
        { name: "Testimonials", count: Number(testimonialsCount.count) },
        { name: "Comments", count: Number(commentsCount.count) },
        { name: "Reviews", count: Number(reviewsCount.count) },
        { name: "Activity Logs", count: Number(activityCount.count) },
      ];

      const totalRecords = tableStats.reduce((sum, t) => sum + t.count, 0);
      const estimatedSize = (totalRecords * 0.5).toFixed(1);

      return {
        databaseSize: `${estimatedSize} KB`,
        tableStats,
        serverUptime: process.uptime(),
        lastCheck: new Date(),
        status: "Healthy",
      };
    } catch (error) {
      return {
        databaseSize: "Unknown",
        tableStats: [],
        serverUptime: process.uptime(),
        lastCheck: new Date(),
        status: "Error",
      };
    }
  }

  async getActivityLogs(limit: number, offset: number): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit).offset(offset);
  }

  async clearActivityLogs(): Promise<void> {
    await db.delete(activityLogs);
  }

  // Security Settings
  async getSecuritySetting(key: string): Promise<SecuritySetting | undefined> {
    const [setting] = await db.select().from(securitySettings).where(eq(securitySettings.key, key));
    return setting || undefined;
  }

  async getAllSecuritySettings(): Promise<SecuritySetting[]> {
    return await db.select().from(securitySettings);
  }

  async upsertSecuritySetting(key: string, value: any): Promise<SecuritySetting> {
    const existing = await this.getSecuritySetting(key);
    if (existing) {
      const [updated] = await db
        .update(securitySettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(securitySettings.key, key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(securitySettings).values({ key, value }).returning();
    return created;
  }

  // Trusted Devices
  async getTrustedDevice(id: number): Promise<TrustedDevice | undefined> {
    const [device] = await db.select().from(trustedDevices).where(eq(trustedDevices.id, id));
    return device || undefined;
  }

  async getTrustedDevicesByUser(userId: number): Promise<TrustedDevice[]> {
    return await db.select().from(trustedDevices).where(eq(trustedDevices.userId, userId)).orderBy(desc(trustedDevices.lastUsed));
  }

  async createTrustedDevice(device: InsertTrustedDevice): Promise<TrustedDevice> {
    const [created] = await db.insert(trustedDevices).values(device).returning();
    return created;
  }

  async updateTrustedDevice(id: number, device: Partial<InsertTrustedDevice>): Promise<TrustedDevice | undefined> {
    const [updated] = await db.update(trustedDevices).set(device).where(eq(trustedDevices.id, id)).returning();
    return updated || undefined;
  }

  async deleteTrustedDevice(id: number): Promise<boolean> {
    const result = await db.delete(trustedDevices).where(eq(trustedDevices.id, id));
    return true;
  }

  // User Sessions
  async getUserSession(id: number): Promise<UserSession | undefined> {
    const [session] = await db.select().from(userSessions).where(eq(userSessions.id, id));
    return session || undefined;
  }

  async getUserSessionBySessionId(sessionId: string): Promise<UserSession | undefined> {
    const [session] = await db.select().from(userSessions).where(eq(userSessions.sessionId, sessionId));
    return session || undefined;
  }

  async getActiveSessionsByUser(userId: number): Promise<UserSession[]> {
    return await db.select().from(userSessions).where(and(eq(userSessions.userId, userId), eq(userSessions.active, true))).orderBy(desc(userSessions.lastActivity));
  }

  async getAllActiveSessions(): Promise<UserSession[]> {
    return await db.select().from(userSessions).where(eq(userSessions.active, true)).orderBy(desc(userSessions.lastActivity));
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [created] = await db.insert(userSessions).values(session).returning();
    return created;
  }

  async updateUserSession(id: number, session: Partial<InsertUserSession>): Promise<UserSession | undefined> {
    const [updated] = await db.update(userSessions).set({ ...session, lastActivity: new Date() }).where(eq(userSessions.id, id)).returning();
    return updated || undefined;
  }

  async terminateSession(id: number): Promise<boolean> {
    await db.update(userSessions).set({ active: false }).where(eq(userSessions.id, id));
    return true;
  }

  async terminateAllUserSessions(userId: number): Promise<boolean> {
    await db.update(userSessions).set({ active: false }).where(eq(userSessions.userId, userId));
    return true;
  }

  async terminateAllSessions(): Promise<boolean> {
    await db.update(userSessions).set({ active: false });
    return true;
  }

  // IP Rules
  async getIpRule(id: number): Promise<IpRule | undefined> {
    const [rule] = await db.select().from(ipRules).where(eq(ipRules.id, id));
    return rule || undefined;
  }

  async getIpRulesByType(type: string): Promise<IpRule[]> {
    return await db.select().from(ipRules).where(eq(ipRules.type, type)).orderBy(desc(ipRules.createdAt));
  }

  async getAllIpRules(): Promise<IpRule[]> {
    return await db.select().from(ipRules).orderBy(desc(ipRules.createdAt));
  }

  async createIpRule(rule: InsertIpRule): Promise<IpRule> {
    const [created] = await db.insert(ipRules).values(rule).returning();
    return created;
  }

  async deleteIpRule(id: number): Promise<boolean> {
    await db.delete(ipRules).where(eq(ipRules.id, id));
    return true;
  }

  async isIpWhitelisted(ip: string): Promise<boolean> {
    const [rule] = await db.select().from(ipRules).where(and(eq(ipRules.ipAddress, ip), eq(ipRules.type, "whitelist")));
    return !!rule;
  }

  async isIpBlacklisted(ip: string): Promise<boolean> {
    const [rule] = await db.select().from(ipRules).where(and(eq(ipRules.ipAddress, ip), eq(ipRules.type, "blacklist")));
    return !!rule;
  }

  // Security Logs
  async getSecurityLog(id: number): Promise<SecurityLog | undefined> {
    const [log] = await db.select().from(securityLogs).where(eq(securityLogs.id, id));
    return log || undefined;
  }

  async getSecurityLogsByType(eventType: string): Promise<SecurityLog[]> {
    return await db.select().from(securityLogs).where(eq(securityLogs.eventType, eventType)).orderBy(desc(securityLogs.createdAt));
  }

  async getRecentSecurityLogs(limit: number = 100): Promise<SecurityLog[]> {
    return await db.select().from(securityLogs).orderBy(desc(securityLogs.createdAt)).limit(limit);
  }

  async createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog> {
    const [created] = await db.insert(securityLogs).values(log).returning();
    return created;
  }

  // Homepage Sections
  async getAllHomepageSections(): Promise<HomepageSection[]> {
    return await db.select().from(homepageSections).orderBy(asc(homepageSections.order));
  }

  async getHomepageSectionByName(name: string): Promise<HomepageSection | undefined> {
    const [section] = await db.select().from(homepageSections).where(eq(homepageSections.name, name));
    return section || undefined;
  }

  async updateHomepageSection(name: string, section: Partial<InsertHomepageSection>): Promise<HomepageSection | undefined> {
    const [updated] = await db.update(homepageSections).set({ ...section, updatedAt: new Date() }).where(eq(homepageSections.name, name)).returning();
    return updated || undefined;
  }

  async upsertHomepageSection(name: string, section: Partial<InsertHomepageSection>): Promise<HomepageSection> {
    const existing = await this.getHomepageSectionByName(name);
    if (existing) {
      const mergedData = {
        name: existing.name,
        visible: section.visible !== undefined ? section.visible : existing.visible,
        order: section.order !== undefined ? section.order : existing.order,
        updatedAt: new Date()
      };
      
      const [updated] = await db.update(homepageSections)
        .set(mergedData)
        .where(eq(homepageSections.name, name))
        .returning();
      return updated;
    }
    
    const defaultOrder = await this.getAllHomepageSections().then(s => s.length);
    const [created] = await db.insert(homepageSections).values({
      name,
      visible: section.visible ?? true,
      order: section.order ?? defaultOrder
    }).returning();
    return created;
  }

  async getSecurityStats(): Promise<{
    totalBlocked: number;
    totalAllowed: number;
    byEventType: { type: string; count: number }[];
  }> {
    const [blockedCount] = await db.select({ count: sql<number>`count(*)` }).from(securityLogs).where(eq(securityLogs.blocked, true));
    const [allowedCount] = await db.select({ count: sql<number>`count(*)` }).from(securityLogs).where(eq(securityLogs.blocked, false));
    
    const byType = await db
      .select({ 
        type: securityLogs.eventType, 
        count: sql<number>`count(*)` 
      })
      .from(securityLogs)
      .groupBy(securityLogs.eventType);

    return {
      totalBlocked: Number(blockedCount.count) || 0,
      totalAllowed: Number(allowedCount.count) || 0,
      byEventType: byType.map(t => ({ type: t.type, count: Number(t.count) })),
    };
  }

  // FAQs
  async getFAQ(id: number): Promise<FAQ | undefined> {
    const [faq] = await db.select().from(faqs).where(eq(faqs.id, id));
    return faq || undefined;
  }

  async getAllFAQs(): Promise<FAQ[]> {
    return await db.select().from(faqs).orderBy(asc(faqs.order));
  }

  async getVisibleFAQs(): Promise<FAQ[]> {
    return await db.select().from(faqs).where(eq(faqs.visible, true)).orderBy(asc(faqs.order));
  }

  async createFAQ(insertFAQ: InsertFAQ): Promise<FAQ> {
    const [faq] = await db.insert(faqs).values(insertFAQ).returning();
    return faq;
  }

  async updateFAQ(id: number, faqData: Partial<InsertFAQ>): Promise<FAQ | undefined> {
    const [faq] = await db.update(faqs).set({ ...faqData, updatedAt: new Date() }).where(eq(faqs.id, id)).returning();
    return faq || undefined;
  }

  async deleteFAQ(id: number): Promise<boolean> {
    const result = await db.delete(faqs).where(eq(faqs.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
