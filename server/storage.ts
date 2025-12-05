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
  firewallRules, type FirewallRule, type InsertFirewallRule,
  geoBlocking, type GeoBlocking, type InsertGeoBlocking,
  rateLimitRules, type RateLimitRule, type InsertRateLimitRule,
  userAgentRules, type UserAgentRule, type InsertUserAgentRule,
  blockedRequests, type BlockedRequest, type InsertBlockedRequest,
  homepageSections, type HomepageSection, type InsertHomepageSection,
  faqs, type FAQ, type InsertFAQ,
  webauthnCredentials, type WebAuthnCredential, type InsertWebAuthnCredential,
  passwordResetTokens, type PasswordResetToken, type InsertPasswordResetToken,
  subscribers, type Subscriber, type InsertSubscriber,
  emailTemplates, type EmailTemplate, type InsertEmailTemplate,
  emailCampaigns, type EmailCampaign, type InsertEmailCampaign,
  contentVersions, type ContentVersion, type InsertContentVersion,
  contentDrafts, type ContentDraft, type InsertContentDraft,
  scheduledContent, type ScheduledContent, type InsertScheduledContent,
  commentLikes, type CommentLike, type InsertCommentLike,
  commentReports, type CommentReport, type InsertCommentReport,
  searchHistory, type SearchHistory, type InsertSearchHistory,
  pageViews, type PageView, type InsertPageView,
  translations, type Translation, type InsertTranslation,
  contentTemplates, type ContentTemplate, type InsertContentTemplate,
  mediaFolders, type MediaFolder, type InsertMediaFolder,
  scheduledTasks, type ScheduledTask, type InsertScheduledTask,
  webhooks, type Webhook, type InsertWebhook,
  webhookLogs, type WebhookLog, type InsertWebhookLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, ilike, sql, lt } from "drizzle-orm";

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
  getAllCategories(): Promise<Category[]>;
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
  getSystemLogs(limit?: number): Promise<any[]>;
  clearSystemLogs(): Promise<void>;
  createSystemLog(log: { level: string; message: string; source: string; metadata?: any }): Promise<any>;

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
  terminateSessionBySessionId(sessionId: string): Promise<void>;
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
  getLoginHistory(limit?: number): Promise<SecurityLog[]>;
  createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog>;
  getSecurityStats(): Promise<{
    totalBlocked: number;
    totalAllowed: number;
    byEventType: { type: string; count: number }[];
  }>;
  getSecurityLogs(limit?: number, offset?: number, type?: string): Promise<SecurityLog[]>;

  // Firewall Rules
  getFirewallRule(id: number): Promise<FirewallRule | undefined>;
  getAllFirewallRules(): Promise<FirewallRule[]>;
  getEnabledFirewallRules(): Promise<FirewallRule[]>;
  createFirewallRule(rule: InsertFirewallRule): Promise<FirewallRule>;
  updateFirewallRule(id: number, rule: Partial<InsertFirewallRule>): Promise<FirewallRule | undefined>;
  deleteFirewallRule(id: number): Promise<boolean>;
  incrementFirewallRuleHit(id: number): Promise<void>;

  // Geo Blocking
  getGeoBlockingRule(id: number): Promise<GeoBlocking | undefined>;
  getGeoBlockingByCountry(countryCode: string): Promise<GeoBlocking | undefined>;
  getAllGeoBlockingRules(): Promise<GeoBlocking[]>;
  createGeoBlockingRule(rule: InsertGeoBlocking): Promise<GeoBlocking>;
  updateGeoBlockingRule(id: number, rule: Partial<InsertGeoBlocking>): Promise<GeoBlocking | undefined>;
  deleteGeoBlockingRule(id: number): Promise<boolean>;

  // Rate Limit Rules
  getRateLimitRule(id: number): Promise<RateLimitRule | undefined>;
  getAllRateLimitRules(): Promise<RateLimitRule[]>;
  getEnabledRateLimitRules(): Promise<RateLimitRule[]>;
  createRateLimitRule(rule: InsertRateLimitRule): Promise<RateLimitRule>;
  updateRateLimitRule(id: number, rule: Partial<InsertRateLimitRule>): Promise<RateLimitRule | undefined>;
  deleteRateLimitRule(id: number): Promise<boolean>;

  // User Agent Rules
  getUserAgentRule(id: number): Promise<UserAgentRule | undefined>;
  getAllUserAgentRules(): Promise<UserAgentRule[]>;
  getEnabledUserAgentRules(): Promise<UserAgentRule[]>;
  createUserAgentRule(rule: InsertUserAgentRule): Promise<UserAgentRule>;
  updateUserAgentRule(id: number, rule: Partial<InsertUserAgentRule>): Promise<UserAgentRule | undefined>;
  deleteUserAgentRule(id: number): Promise<boolean>;

  // Blocked Requests
  getRecentBlockedRequests(limit?: number): Promise<BlockedRequest[]>;
  createBlockedRequest(request: InsertBlockedRequest): Promise<BlockedRequest>;
  getBlockedRequestStats(): Promise<{
    total: number;
    byReason: { reason: string; count: number }[];
    byCountry: { country: string; count: number }[];
  }>;

  // FAQs
  getFAQ(id: number): Promise<FAQ | undefined>;
  getAllFAQs(): Promise<FAQ[]>;
  getVisibleFAQs(): Promise<FAQ[]>;
  createFAQ(faq: InsertFAQ): Promise<FAQ>;
  updateFAQ(id: number, faq: Partial<InsertFAQ>): Promise<FAQ | undefined>;
  deleteFAQ(id: number): Promise<boolean>;

  // WebAuthn Credentials
  createWebAuthnCredential(data: InsertWebAuthnCredential): Promise<WebAuthnCredential>;
  getWebAuthnCredentialsByUser(userId: number): Promise<WebAuthnCredential[]>;
  getWebAuthnCredentialById(credentialId: string): Promise<WebAuthnCredential | undefined>;
  updateWebAuthnCredentialCounter(id: number, counter: number): Promise<void>;
  deleteWebAuthnCredential(id: number): Promise<boolean>;

  // 2FA
  enable2FA(userId: number, secret: string): Promise<User | undefined>;
  disable2FA(userId: number): Promise<User | undefined>;
  verify2FA(userId: number, token: string): Promise<boolean>;
  enableBiometricLogin(userId: number, credentialId: string): Promise<User | undefined>;
  disableBiometricLogin(userId: number): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  private db = db; // Alias db to this.db for consistency

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsernameOrEmail(credential: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(
      sql`${users.username} = ${credential} OR ${users.email} = ${credential}`
    );
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await this.db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Projects
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await this.db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getAllProjects(): Promise<Project[]> {
    return await this.db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getPublishedProjects(): Promise<Project[]> {
    return await this.db.select().from(projects).where(eq(projects.status, "Published")).orderBy(desc(projects.createdAt));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await this.db.insert(projects).values({
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
    const [project] = await this.db.update(projects).set(updateData).where(eq(projects.id, id)).returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await this.db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  async incrementProjectViews(id: number): Promise<void> {
    await this.db.update(projects).set({ views: sql`${projects.views} + 1` }).where(eq(projects.id, id));
  }

  // Posts
  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await this.db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await this.db.select().from(posts).where(eq(posts.slug, slug));
    return post || undefined;
  }

  async getAllPosts(): Promise<Post[]> {
    return await this.db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async getPublishedPosts(): Promise<Post[]> {
    return await this.db.select().from(posts).where(eq(posts.status, "Published")).orderBy(desc(posts.publishedAt));
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
    const [post] = await this.db.insert(posts).values({
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
    const [post] = await this.db.update(posts).set(updateData).where(eq(posts.id, id)).returning();
    return post || undefined;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await this.db.delete(posts).where(eq(posts.id, id)).returning();
    return result.length > 0;
  }

  async incrementPostViews(id: number): Promise<void> {
    await this.db.update(posts).set({ views: sql`${posts.views} + 1` }).where(eq(posts.id, id));
  }

  // Pages
  async getPage(id: number): Promise<Page | undefined> {
    const [page] = await this.db.select().from(pages).where(eq(pages.id, id));
    return page || undefined;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await this.db.select().from(pages).where(eq(pages.slug, slug));
    return page || undefined;
  }

  async getAllPages(): Promise<Page[]> {
    return await this.db.select().from(pages).orderBy(desc(pages.createdAt));
  }

  async getPublishedPages(): Promise<Page[]> {
    return await this.db.select().from(pages).where(eq(pages.status, "Published")).orderBy(desc(pages.publishedAt));
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
    const [page] = await this.db.insert(pages).values({
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
    const [page] = await this.db.update(pages).set(updateData).where(eq(pages.id, id)).returning();
    return page || undefined;
  }

  async deletePage(id: number): Promise<boolean> {
    const result = await this.db.delete(pages).where(eq(pages.id, id)).returning();
    return result.length > 0;
  }

  async incrementPageViews(id: number): Promise<void> {
    await this.db.update(pages).set({ views: sql`${pages.views} + 1` }).where(eq(pages.id, id));
  }

  // Skills
  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await this.db.select().from(skills).where(eq(skills.id, id));
    return skill || undefined;
  }

  async getAllSkills(): Promise<Skill[]> {
    return await this.db.select().from(skills).orderBy(asc(skills.order));
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [skill] = await this.db.insert(skills).values(insertSkill).returning();
    return skill;
  }

  async updateSkill(id: number, skillData: Partial<InsertSkill>): Promise<Skill | undefined> {
    const [skill] = await this.db.update(skills).set(skillData).where(eq(skills.id, id)).returning();
    return skill || undefined;
  }

  async deleteSkill(id: number): Promise<boolean> {
    const result = await this.db.delete(skills).where(eq(skills.id, id)).returning();
    return result.length > 0;
  }

  // Services
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await this.db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getAllServices(): Promise<Service[]> {
    return await this.db.select().from(services).orderBy(asc(services.order));
  }

  async getActiveServices(): Promise<Service[]> {
    return await this.db.select().from(services).where(eq(services.active, true)).orderBy(asc(services.order));
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await this.db.insert(services).values({
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
    const [service] = await this.db.update(services).set(updateData).where(eq(services.id, id)).returning();
    return service || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await this.db.delete(services).where(eq(services.id, id)).returning();
    return result.length > 0;
  }

  // Testimonials
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    const [testimonial] = await this.db.select().from(testimonials).where(eq(testimonials.id, id));
    return testimonial || undefined;
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return await this.db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  }

  async getActiveTestimonials(): Promise<Testimonial[]> {
    return await this.db.select().from(testimonials).where(eq(testimonials.active, true)).orderBy(desc(testimonials.createdAt));
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await this.db.insert(testimonials).values(insertTestimonial).returning();
    return testimonial;
  }

  async updateTestimonial(id: number, testimonialData: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const [testimonial] = await this.db.update(testimonials).set(testimonialData).where(eq(testimonials.id, id)).returning();
    return testimonial || undefined;
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    const result = await this.db.delete(testimonials).where(eq(testimonials.id, id)).returning();
    return result.length > 0;
  }

  // Messages
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await this.db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getAllMessages(): Promise<Message[]> {
    return await this.db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async getUnreadMessages(): Promise<Message[]> {
    return await this.db.select().from(messages).where(eq(messages.read, false)).orderBy(desc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await this.db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<boolean> {
    const result = await this.db.update(messages).set({ read: true }).where(eq(messages.id, id)).returning();
    return result.length > 0;
  }

  async archiveMessage(id: number): Promise<boolean> {
    const result = await this.db.update(messages).set({ archived: true }).where(eq(messages.id, id)).returning();
    return result.length > 0;
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await this.db.delete(messages).where(eq(messages.id, id)).returning();
    return result.length > 0;
  }

  // Activity Logs
  async getAllActivityLogs(limit: number = 50, offset: number = 0): Promise<ActivityLog[]> {
    const logs = await db.select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);
    return logs;
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await this.db.insert(activityLogs).values(insertLog).returning();
    return log;
  }

  // Notifications
  async getAllNotifications(userId?: number): Promise<Notification[]> {
    if (userId) {
      return await this.db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    }
    return await this.db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await this.db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await this.db.update(notifications).set({ read: true }).where(eq(notifications.id, id)).returning();
    return result.length > 0;
  }

  // Site Settings
  async getSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await this.db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting || undefined;
  }

  async getAllSettings(): Promise<SiteSetting[]> {
    return await this.db.select().from(siteSettings);
  }

  async upsertSetting(key: string, value: any): Promise<SiteSetting> {
    const existing = await this.getSetting(key);
    if (existing) {
      const [setting] = await this.db.update(siteSettings).set({ value, updatedAt: new Date() }).where(eq(siteSettings.key, key)).returning();
      return setting;
    } else {
      const [setting] = await this.db.insert(siteSettings).values({ key, value }).returning();
      return setting;
    }
  }

  // Categories
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await this.db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getAllCategories(): Promise<Category[]> {
    return await this.db.select().from(categories);
  }

  async getCategoriesByType(type: string): Promise<Category[]> {
    return await this.db.select().from(categories).where(eq(categories.type, type));
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await this.db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await this.db.update(categories).set(categoryData).where(eq(categories.id, id)).returning();
    return category || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await this.db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }

  // Media
  async getMedia(id: number): Promise<Media | undefined> {
    const [mediaItem] = await this.db.select().from(media).where(eq(media.id, id));
    return mediaItem || undefined;
  }

  async getAllMedia(): Promise<Media[]> {
    return await this.db.select().from(media).orderBy(desc(media.createdAt));
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const [mediaItem] = await this.db.insert(media).values(insertMedia).returning();
    return mediaItem;
  }

  async deleteMedia(id: number): Promise<boolean> {
    const result = await this.db.delete(media).where(eq(media.id, id)).returning();
    return result.length > 0;
  }

  // Comments
  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await this.db.select().from(comments).where(eq(comments.id, id));
    return comment || undefined;
  }

  async getAllComments(): Promise<Comment[]> {
    return await this.db.select().from(comments).orderBy(desc(comments.createdAt));
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return await this.db.select().from(comments).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
  }

  async getCommentsByProject(projectId: number): Promise<Comment[]> {
    return await this.db.select().from(comments).where(eq(comments.projectId, projectId)).orderBy(desc(comments.createdAt));
  }

  async getApprovedCommentsByPost(postId: number): Promise<Comment[]> {
    return await this.db.select().from(comments)
      .where(and(eq(comments.postId, postId), eq(comments.status, "Approved")))
      .orderBy(desc(comments.createdAt));
  }

  async getApprovedCommentsByProject(projectId: number): Promise<Comment[]> {
    return await this.db.select().from(comments)
      .where(and(eq(comments.projectId, projectId), eq(comments.status, "Approved")))
      .orderBy(desc(comments.createdAt));
  }

  async getPendingComments(): Promise<Comment[]> {
    return await this.db.select().from(comments).where(eq(comments.status, "Pending")).orderBy(desc(comments.createdAt));
  }

  async getUnreadComments(): Promise<Comment[]> {
    return await this.db.select().from(comments).where(eq(comments.read, false)).orderBy(desc(comments.createdAt));
  }

  async getUnarchivedComments(): Promise<Comment[]> {
    return await this.db.select().from(comments).where(eq(comments.archived, false)).orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await this.db.insert(comments).values(insertComment).returning();
    return comment;
  }

  async updateComment(id: number, commentData: Partial<InsertComment>): Promise<Comment | undefined> {
    const [comment] = await this.db.update(comments).set(commentData).where(eq(comments.id, id)).returning();
    return comment || undefined;
  }

  async approveComment(id: number): Promise<boolean> {
    const result = await this.db.update(comments).set({ status: "Approved" }).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  async markCommentAsRead(id: number): Promise<boolean> {
    const result = await this.db.update(comments).set({ read: true }).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  async archiveComment(id: number): Promise<boolean> {
    const result = await this.db.update(comments).set({ archived: true }).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await this.db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  // Reviews
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await this.db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async getAllReviews(): Promise<Review[]> {
    return await this.db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async getReviewsByProject(projectId: number): Promise<Review[]> {
    return await this.db.select().from(reviews).where(eq(reviews.projectId, projectId)).orderBy(desc(reviews.createdAt));
  }

  async getApprovedReviewsByProject(projectId: number): Promise<Review[]> {
    return await this.db.select().from(reviews)
      .where(and(eq(reviews.projectId, projectId), eq(reviews.status, "Approved")))
      .orderBy(desc(reviews.createdAt));
  }

  async getPendingReviews(): Promise<Review[]> {
    return await this.db.select().from(reviews).where(eq(reviews.status, "Pending")).orderBy(desc(reviews.createdAt));
  }

  async getUnreadReviews(): Promise<Review[]> {
    return await this.db.select().from(reviews).where(eq(reviews.read, false)).orderBy(desc(reviews.createdAt));
  }

  async getUnarchivedReviews(): Promise<Review[]> {
    return await this.db.select().from(reviews).where(eq(reviews.archived, false)).orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await this.db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async updateReview(id: number, reviewData: Partial<InsertReview>): Promise<Review | undefined> {
    const [review] = await this.db.update(reviews).set(reviewData).where(eq(reviews.id, id)).returning();
    return review || undefined;
  }

  async approveReview(id: number): Promise<boolean> {
    const result = await this.db.update(reviews).set({ status: "Approved" }).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }

  async markReviewAsRead(id: number): Promise<boolean> {
    const result = await this.db.update(reviews).set({ read: true }).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }

  async archiveReview(id: number): Promise<boolean> {
    const result = await this.db.update(reviews).set({ archived: true }).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }

  async deleteReview(id: number): Promise<boolean> {
    const result = await this.db.delete(reviews).where(eq(reviews.id, id)).returning();
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
      const [usersCount] = await this.db.select({ count: sql<number>`count(*)` }).from(users);
      const [projectsCount] = await this.db.select({ count: sql<number>`count(*)` }).from(projects);
      const [postsCount] = await this.db.select({ count: sql<number>`count(*)` }).from(posts);
      const [skillsCount] = await this.db.select({ count: sql<number>`count(*)` }).from(skills);
      const [servicesCount] = await this.db.select({ count: sql<number>`count(*)` }).from(services);
      const [messagesCount] = await this.db.select({ count: sql<number>`count(*)` }).from(messages);
      const [testimonialsCount] = await this.db.select({ count: sql<number>`count(*)` }).from(testimonials);
      const [commentsCount] = await this.db.select({ count: sql<number>`count(*)` }).from(comments);
      const [reviewsCount] = await this.db.select({ count: sql<number>`count(*)` }).from(reviews);
      const [activityCount] = await this.db.select({ count: sql<number>`count(*)` }).from(activityLogs);

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
      console.error("Error getting system stats:", error);
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
    return await this.db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit).offset(offset);
  }

  async clearActivityLogs(): Promise<void> {
    await this.db.delete(activityLogs);
  }

  async getSystemLogs(limit: number = 100): Promise<any[]> {
    return await this.db.select().from(securityLogs).orderBy(desc(securityLogs.createdAt)).limit(limit);
  }

  async clearSystemLogs(): Promise<void> {
    await this.db.delete(securityLogs);
  }

  async createSystemLog(log: { level: string; message: string; source: string; metadata?: any }): Promise<any> {
    const [created] = await this.db.insert(securityLogs).values({
      eventType: log.level,
      action: log.message,
      ipAddress: log.source,
    }).returning();
    return created;
  }

  // Security Settings
  async getSecuritySetting(key: string): Promise<SecuritySetting | undefined> {
    const [setting] = await this.db.select().from(securitySettings).where(eq(securitySettings.key, key));
    return setting || undefined;
  }

  async getAllSecuritySettings(): Promise<SecuritySetting[]> {
    return await this.db.select().from(securitySettings);
  }

  async upsertSecuritySetting(key: string, value: any): Promise<SecuritySetting> {
    const existing = await this.getSecuritySetting(key);
    if (existing) {
      const [updated] = await this.db
        .update(securitySettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(securitySettings.key, key))
        .returning();
      return updated;
    }
    const [created] = await this.db.insert(securitySettings).values({ key, value }).returning();
    return created;
  }

  // Trusted Devices
  async getTrustedDevice(id: number): Promise<TrustedDevice | undefined> {
    const [device] = await this.db.select().from(trustedDevices).where(eq(trustedDevices.id, id));
    return device || undefined;
  }

  async getTrustedDevicesByUser(userId: number): Promise<TrustedDevice[]> {
    return this.db.select().from(trustedDevices).where(eq(trustedDevices.userId, userId)).orderBy(desc(trustedDevices.lastUsed));
  }

  async createTrustedDevice(device: InsertTrustedDevice): Promise<TrustedDevice> {
    const [created] = await this.db.insert(trustedDevices).values(device).returning();
    return created;
  }

  async updateTrustedDevice(id: number, device: Partial<InsertTrustedDevice>): Promise<TrustedDevice | undefined> {
    const [updated] = await this.db.update(trustedDevices).set(device).where(eq(trustedDevices.id, id)).returning();
    return updated || undefined;
  }

  async deleteTrustedDevice(id: number): Promise<boolean> {
    const result = await this.db.delete(trustedDevices).where(eq(trustedDevices.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // User Sessions
  async getUserSession(id: number): Promise<UserSession | undefined> {
    const [session] = await this.db.select().from(userSessions).where(eq(userSessions.id, id));
    return session || undefined;
  }

  async getUserSessionBySessionId(sessionId: string): Promise<UserSession | undefined> {
    const [session] = await this.db.select().from(userSessions).where(eq(userSessions.sessionId, sessionId));
    return session || undefined;
  }

  async getActiveSessionsByUser(userId: number): Promise<UserSession[]> {
    return await this.db.select().from(userSessions).where(and(eq(userSessions.userId, userId), eq(userSessions.active, true))).orderBy(desc(userSessions.lastActivity));
  }

  async getAllActiveSessions(): Promise<UserSession[]> {
    return await this.db.select().from(userSessions).where(eq(userSessions.active, true)).orderBy(desc(userSessions.lastActivity));
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [created] = await this.db.insert(userSessions).values(session).returning();
    return created;
  }

  async updateUserSession(id: number, session: Partial<InsertUserSession>): Promise<UserSession | undefined> {
    const [updated] = await this.db.update(userSessions).set({ ...session, lastActivity: new Date() }).where(eq(userSessions.id, id)).returning();
    return updated || undefined;
  }

  async terminateSession(id: number): Promise<boolean> {
    await this.db.update(userSessions).set({ active: false }).where(eq(userSessions.id, id));
    return true;
  }

  async terminateSessionBySessionId(sessionId: string): Promise<void> {
    await this.db.delete(userSessions).where(eq(userSessions.sessionId, sessionId));
  }

  async terminateAllUserSessions(userId: number): Promise<boolean> {
    await this.db.update(userSessions).set({ active: false }).where(eq(userSessions.userId, userId));
    return true;
  }

  async terminateAllSessions(): Promise<boolean> {
    await this.db.update(userSessions).set({ active: false });
    return true;
  }

  // IP Rules
  async getIpRule(id: number): Promise<IpRule | undefined> {
    const [rule] = await this.db.select().from(ipRules).where(eq(ipRules.id, id));
    return rule || undefined;
  }

  async getIpRulesByType(type: string): Promise<IpRule[]> {
    return await this.db.select().from(ipRules).where(eq(ipRules.type, type)).orderBy(desc(ipRules.createdAt));
  }

  async getAllIpRules(): Promise<IpRule[]> {
    return await this.db.select().from(ipRules).orderBy(desc(ipRules.createdAt));
  }

  async createIpRule(rule: InsertIpRule): Promise<IpRule> {
    const [created] = await this.db.insert(ipRules).values(rule).returning();
    return created;
  }

  async deleteIpRule(id: number): Promise<boolean> {
    const result = await this.db.delete(ipRules).where(eq(ipRules.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async isIpWhitelisted(ip: string): Promise<boolean> {
    const [rule] = await this.db.select().from(ipRules).where(and(eq(ipRules.ipAddress, ip), eq(ipRules.type, "whitelist")));
    return !!rule;
  }

  async isIpBlacklisted(ip: string): Promise<boolean> {
    const [rule] = await this.db.select().from(ipRules).where(and(eq(ipRules.ipAddress, ip), eq(ipRules.type, "blacklist")));
    return !!rule;
  }

  // Security Logs
  async getSecurityLog(id: number): Promise<SecurityLog | undefined> {
    const [log] = await this.db.select().from(securityLogs).where(eq(securityLogs.id, id));
    return log || undefined;
  }

  async getSecurityLogsByType(eventType: string): Promise<SecurityLog[]> {
    return await this.db.select().from(securityLogs).where(eq(securityLogs.eventType, eventType)).orderBy(desc(securityLogs.createdAt));
  }

  async getRecentSecurityLogs(limit: number = 100): Promise<SecurityLog[]> {
    return await this.db.select().from(securityLogs).orderBy(desc(securityLogs.createdAt)).limit(limit);
  }

  async getLoginHistory(limit: number = 50): Promise<SecurityLog[]> {
    return await this.db.select().from(securityLogs)
      .where(
        or(
          eq(securityLogs.eventType, 'login_success'),
          eq(securityLogs.eventType, 'login_failed'),
          eq(securityLogs.eventType, 'two_factor_failed'),
          eq(securityLogs.eventType, 'password_expired')
        )
      )
      .orderBy(desc(securityLogs.createdAt))
      .limit(limit);
  }

  async createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog> {
    const [created] = await this.db.insert(securityLogs).values(log).returning();
    return created;
  }

  async getSecurityStats(): Promise<{
    totalBlocked: number;
    totalAllowed: number;
    byEventType: { type: string; count: number }[];
  }> {
    const [blockedCount] = await this.db.select({ count: sql<number>`count(*)` }).from(securityLogs).where(eq(securityLogs.blocked, true));
    const [allowedCount] = await this.db.select({ count: sql<number>`count(*)` }).from(securityLogs).where(eq(securityLogs.blocked, false));

    const byType = await this.db
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

  async getSecurityLogs(limit: number = 100, offset: number = 0, type?: string): Promise<SecurityLog[]> {
    const query = this.db.select().from(securityLogs);

    if (type === 'login') {
      query.where(
        or(
          eq(securityLogs.eventType, 'login_success'),
          eq(securityLogs.eventType, 'login_failed'),
          eq(securityLogs.eventType, 'login_lockout')
        )
      );
    }

    return await query.orderBy(desc(securityLogs.createdAt)).limit(limit).offset(offset);
  }

  // Firewall Rules
  async getFirewallRule(id: number): Promise<FirewallRule | undefined> {
    const [rule] = await this.db.select().from(firewallRules).where(eq(firewallRules.id, id));
    return rule || undefined;
  }

  async getAllFirewallRules(): Promise<FirewallRule[]> {
    return await this.db.select().from(firewallRules).orderBy(asc(firewallRules.priority));
  }

  async getEnabledFirewallRules(): Promise<FirewallRule[]> {
    return await this.db.select().from(firewallRules)
      .where(eq(firewallRules.enabled, true))
      .orderBy(asc(firewallRules.priority));
  }

  async createFirewallRule(rule: InsertFirewallRule): Promise<FirewallRule> {
    const [created] = await this.db.insert(firewallRules).values(rule).returning();
    return created;
  }

  async updateFirewallRule(id: number, rule: Partial<InsertFirewallRule>): Promise<FirewallRule | undefined> {
    const [updated] = await this.db.update(firewallRules)
      .set({ ...rule, updatedAt: new Date() })
      .where(eq(firewallRules.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteFirewallRule(id: number): Promise<boolean> {
    const result = await this.db.delete(firewallRules).where(eq(firewallRules.id, id));
    return true;
  }

  async incrementFirewallRuleHit(id: number): Promise<void> {
    await this.db.update(firewallRules)
      .set({ 
        hitCount: sql`${firewallRules.hitCount} + 1`,
        lastHit: new Date()
      })
      .where(eq(firewallRules.id, id));
  }

  // Geo Blocking
  async getGeoBlockingRule(id: number): Promise<GeoBlocking | undefined> {
    const [rule] = await this.db.select().from(geoBlocking).where(eq(geoBlocking.id, id));
    return rule || undefined;
  }

  async getGeoBlockingByCountry(countryCode: string): Promise<GeoBlocking | undefined> {
    const [rule] = await this.db.select().from(geoBlocking).where(eq(geoBlocking.countryCode, countryCode));
    return rule || undefined;
  }

  async getAllGeoBlockingRules(): Promise<GeoBlocking[]> {
    return await this.db.select().from(geoBlocking).orderBy(asc(geoBlocking.countryName));
  }

  async createGeoBlockingRule(rule: InsertGeoBlocking): Promise<GeoBlocking> {
    const [created] = await this.db.insert(geoBlocking).values(rule).returning();
    return created;
  }

  async updateGeoBlockingRule(id: number, rule: Partial<InsertGeoBlocking>): Promise<GeoBlocking | undefined> {
    const [updated] = await this.db.update(geoBlocking)
      .set(rule)
      .where(eq(geoBlocking.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteGeoBlockingRule(id: number): Promise<boolean> {
    await this.db.delete(geoBlocking).where(eq(geoBlocking.id, id));
    return true;
  }

  // Rate Limit Rules
  async getRateLimitRule(id: number): Promise<RateLimitRule | undefined> {
    const [rule] = await this.db.select().from(rateLimitRules).where(eq(rateLimitRules.id, id));
    return rule || undefined;
  }

  async getAllRateLimitRules(): Promise<RateLimitRule[]> {
    return await this.db.select().from(rateLimitRules).orderBy(asc(rateLimitRules.name));
  }

  async getEnabledRateLimitRules(): Promise<RateLimitRule[]> {
    return await this.db.select().from(rateLimitRules)
      .where(eq(rateLimitRules.enabled, true))
      .orderBy(asc(rateLimitRules.name));
  }

  async createRateLimitRule(rule: InsertRateLimitRule): Promise<RateLimitRule> {
    const [created] = await this.db.insert(rateLimitRules).values(rule).returning();
    return created;
  }

  async updateRateLimitRule(id: number, rule: Partial<InsertRateLimitRule>): Promise<RateLimitRule | undefined> {
    const [updated] = await this.db.update(rateLimitRules)
      .set({ ...rule, updatedAt: new Date() })
      .where(eq(rateLimitRules.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteRateLimitRule(id: number): Promise<boolean> {
    await this.db.delete(rateLimitRules).where(eq(rateLimitRules.id, id));
    return true;
  }

  // User Agent Rules
  async getUserAgentRule(id: number): Promise<UserAgentRule | undefined> {
    const [rule] = await this.db.select().from(userAgentRules).where(eq(userAgentRules.id, id));
    return rule || undefined;
  }

  async getAllUserAgentRules(): Promise<UserAgentRule[]> {
    return await this.db.select().from(userAgentRules).orderBy(asc(userAgentRules.name));
  }

  async getEnabledUserAgentRules(): Promise<UserAgentRule[]> {
    return await this.db.select().from(userAgentRules)
      .where(eq(userAgentRules.enabled, true))
      .orderBy(asc(userAgentRules.name));
  }

  async createUserAgentRule(rule: InsertUserAgentRule): Promise<UserAgentRule> {
    const [created] = await this.db.insert(userAgentRules).values(rule).returning();
    return created;
  }

  async updateUserAgentRule(id: number, rule: Partial<InsertUserAgentRule>): Promise<UserAgentRule | undefined> {
    const [updated] = await this.db.update(userAgentRules)
      .set(rule)
      .where(eq(userAgentRules.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteUserAgentRule(id: number): Promise<boolean> {
    await this.db.delete(userAgentRules).where(eq(userAgentRules.id, id));
    return true;
  }

  // Blocked Requests
  async getRecentBlockedRequests(limit: number = 100): Promise<BlockedRequest[]> {
    return await this.db.select().from(blockedRequests)
      .orderBy(desc(blockedRequests.createdAt))
      .limit(limit);
  }

  async createBlockedRequest(request: InsertBlockedRequest): Promise<BlockedRequest> {
    const [created] = await this.db.insert(blockedRequests).values(request).returning();
    return created;
  }

  async getBlockedRequestStats(): Promise<{
    total: number;
    byReason: { reason: string; count: number }[];
    byCountry: { country: string; count: number }[];
  }> {
    const [totalCount] = await this.db.select({ count: sql<number>`count(*)` }).from(blockedRequests);
    
    const byReason = await this.db
      .select({
        reason: blockedRequests.reason,
        count: sql<number>`count(*)`
      })
      .from(blockedRequests)
      .groupBy(blockedRequests.reason);

    const byCountry = await this.db
      .select({
        country: blockedRequests.countryCode,
        count: sql<number>`count(*)`
      })
      .from(blockedRequests)
      .where(sql`${blockedRequests.countryCode} IS NOT NULL`)
      .groupBy(blockedRequests.countryCode);

    return {
      total: Number(totalCount.count) || 0,
      byReason: byReason.map(r => ({ reason: r.reason, count: Number(r.count) })),
      byCountry: byCountry.map(c => ({ country: c.country || 'Unknown', count: Number(c.count) })),
    };
  }

  // Homepage Sections
  async getAllHomepageSections(): Promise<HomepageSection[]> {
    return await this.db.select().from(homepageSections).orderBy(asc(homepageSections.order));
  }

  async getHomepageSectionByName(name: string): Promise<HomepageSection | undefined> {
    const [section] = await this.db.select().from(homepageSections).where(eq(homepageSections.name, name));
    return section || undefined;
  }

  async updateHomepageSection(name: string, section: Partial<InsertHomepageSection>): Promise<HomepageSection | undefined> {
    const [updated] = await this.db.update(homepageSections).set({ ...section, updatedAt: new Date() }).where(eq(homepageSections.name, name)).returning();
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

      const [updated] = await this.db.update(homepageSections)
        .set(mergedData)
        .where(eq(homepageSections.name, name))
        .returning();
      return updated;
    }

    const defaultOrder = await this.getAllHomepageSections().then(s => s.length);
    const [created] = await this.db.insert(homepageSections).values({
      name,
      visible: section.visible ?? true,
      order: section.order ?? defaultOrder
    }).returning();
    return created;
  }

  // FAQs
  async getFAQ(id: number): Promise<FAQ | undefined> {
    const [faq] = await this.db.select().from(faqs).where(eq(faqs.id, id));
    return faq || undefined;
  }

  async getAllFAQs(): Promise<FAQ[]> {
    return await this.db.select().from(faqs).orderBy(asc(faqs.order));
  }

  async getVisibleFAQs(): Promise<FAQ[]> {
    return await this.db.select().from(faqs).where(eq(faqs.visible, true)).orderBy(asc(faqs.order));
  }

  async createFAQ(insertFAQ: InsertFAQ): Promise<FAQ> {
    const [faq] = await this.db.insert(faqs).values(insertFAQ).returning();
    return faq;
  }

  async updateFAQ(id: number, faqData: Partial<InsertFAQ>): Promise<FAQ | undefined> {
    const [faq] = await this.db.update(faqs).set({ ...faqData, updatedAt: new Date() }).where(eq(faqs.id, id)).returning();
    return faq || undefined;
  }

  async deleteFAQ(id: number): Promise<boolean> {
    const result = await this.db.delete(faqs).where(eq(faqs.id, id)).returning();
    return result.length > 0;
  }

  // WebAuthn Credentials
  async createWebAuthnCredential(data: InsertWebAuthnCredential): Promise<WebAuthnCredential> {
    const [credential] = await this.db.insert(webauthnCredentials).values(data).returning();
    return credential;
  }

  async getWebAuthnCredentialsByUser(userId: number): Promise<WebAuthnCredential[]> {
    return this.db.select().from(webauthnCredentials).where(eq(webauthnCredentials.userId, userId));
  }

  async getWebAuthnCredentialById(credentialId: string): Promise<WebAuthnCredential | undefined> {
    const [credential] = await this.db.select().from(webauthnCredentials).where(eq(webauthnCredentials.credentialId, credentialId));
    return credential;
  }

  async updateWebAuthnCredentialCounter(id: number, counter: number): Promise<void> {
    await this.db.update(webauthnCredentials)
      .set({ counter, lastUsed: new Date() })
      .where(eq(webauthnCredentials.id, id));
  }

  async deleteWebAuthnCredential(id: number): Promise<boolean> {
    const result = await this.db.delete(webauthnCredentials).where(eq(webauthnCredentials.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // 2FA Methods
  async enable2FA(userId: number, secret: string): Promise<User | undefined> {
    const [user] = await this.db.update(users)
      .set({ twoFactorSecret: secret, twoFactorEnabled: true })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async disable2FA(userId: number): Promise<User | undefined> {
    const [user] = await this.db.update(users)
      .set({ twoFactorSecret: null, twoFactorEnabled: false })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async verify2FA(userId: number, token: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.twoFactorSecret) {
      return false;
    }

    // Import speakeasy dynamically to verify the token
    try {
      const speakeasy = require('speakeasy');
      return speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2
      });
    } catch (error) {
      console.error('2FA verification error:', error);
      return false;
    }
  }

  async enableBiometricLogin(userId: number, credentialId: string): Promise<User | undefined> {
    // WebAuthn credentials are stored in a separate table, not in users
    // This method just returns the user to maintain interface compatibility
    return await this.getUser(userId);
  }

  async disableBiometricLogin(userId: number): Promise<User | undefined> {
    // Delete all WebAuthn credentials for this user
    await this.db.delete(webauthnCredentials).where(eq(webauthnCredentials.userId, userId));
    return await this.getUser(userId);
  }

  // Password Reset Tokens
  async createPasswordResetToken(data: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [token] = await this.db.insert(passwordResetTokens).values(data).returning();
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [result] = await this.db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return result;
  }

  async markPasswordResetTokenUsed(id: number): Promise<void> {
    await this.db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, id));
  }

  async deleteExpiredPasswordResetTokens(): Promise<void> {
    await this.db.delete(passwordResetTokens).where(lt(passwordResetTokens.expiresAt, new Date()));
  }

  // Subscribers
  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    const [subscriber] = await this.db.select().from(subscribers).where(eq(subscribers.id, id));
    return subscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await this.db.select().from(subscribers).where(eq(subscribers.email, email));
    return subscriber;
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return this.db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
  }

  async getActiveSubscribers(): Promise<Subscriber[]> {
    return this.db.select().from(subscribers).where(eq(subscribers.status, 'active')).orderBy(desc(subscribers.createdAt));
  }

  async createSubscriber(data: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await this.db.insert(subscribers).values(data).returning();
    return subscriber;
  }

  async updateSubscriber(id: number, data: Partial<InsertSubscriber>): Promise<Subscriber | undefined> {
    const [subscriber] = await this.db.update(subscribers).set(data).where(eq(subscribers.id, id)).returning();
    return subscriber;
  }

  async deleteSubscriber(id: number): Promise<boolean> {
    const result = await this.db.delete(subscribers).where(eq(subscribers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Email Templates
  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    const [template] = await this.db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template;
  }

  async getAllEmailTemplates(): Promise<EmailTemplate[]> {
    return this.db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
  }

  async createEmailTemplate(data: InsertEmailTemplate): Promise<EmailTemplate> {
    const [template] = await this.db.insert(emailTemplates).values(data).returning();
    return template;
  }

  async updateEmailTemplate(id: number, data: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const [template] = await this.db.update(emailTemplates).set({ ...data, updatedAt: new Date() }).where(eq(emailTemplates.id, id)).returning();
    return template;
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    const result = await this.db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Email Campaigns
  async getEmailCampaign(id: number): Promise<EmailCampaign | undefined> {
    const [campaign] = await this.db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id));
    return campaign;
  }

  async getAllEmailCampaigns(): Promise<EmailCampaign[]> {
    return this.db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt));
  }

  async createEmailCampaign(data: InsertEmailCampaign): Promise<EmailCampaign> {
    const [campaign] = await this.db.insert(emailCampaigns).values(data).returning();
    return campaign;
  }

  async updateEmailCampaign(id: number, data: Partial<InsertEmailCampaign>): Promise<EmailCampaign | undefined> {
    const [campaign] = await this.db.update(emailCampaigns).set({ ...data, updatedAt: new Date() }).where(eq(emailCampaigns.id, id)).returning();
    return campaign;
  }

  async deleteEmailCampaign(id: number): Promise<boolean> {
    const result = await this.db.delete(emailCampaigns).where(eq(emailCampaigns.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Content Versions
  async getContentVersions(contentType: string, contentId: number): Promise<ContentVersion[]> {
    return this.db.select().from(contentVersions)
      .where(and(eq(contentVersions.contentType, contentType), eq(contentVersions.contentId, contentId)))
      .orderBy(desc(contentVersions.version));
  }

  async createContentVersion(data: InsertContentVersion): Promise<ContentVersion> {
    const [version] = await this.db.insert(contentVersions).values(data).returning();
    return version;
  }

  async getLatestVersionNumber(contentType: string, contentId: number): Promise<number> {
    const [latest] = await this.db.select({ version: contentVersions.version }).from(contentVersions)
      .where(and(eq(contentVersions.contentType, contentType), eq(contentVersions.contentId, contentId)))
      .orderBy(desc(contentVersions.version)).limit(1);
    return latest?.version ?? 0;
  }

  // Content Drafts
  async getContentDraft(userId: number, contentType: string, contentId?: number): Promise<ContentDraft | undefined> {
    const conditions = [eq(contentDrafts.userId, userId), eq(contentDrafts.contentType, contentType)];
    if (contentId !== undefined) {
      conditions.push(eq(contentDrafts.contentId, contentId));
    }
    const [draft] = await this.db.select().from(contentDrafts).where(and(...conditions));
    return draft;
  }

  async upsertContentDraft(data: InsertContentDraft): Promise<ContentDraft> {
    const existing = await this.getContentDraft(data.userId, data.contentType, data.contentId ?? undefined);
    if (existing) {
      const [updated] = await this.db.update(contentDrafts)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(contentDrafts.id, existing.id))
        .returning();
      return updated;
    }
    const [draft] = await this.db.insert(contentDrafts).values(data).returning();
    return draft;
  }

  async deleteContentDraft(id: number): Promise<boolean> {
    const result = await this.db.delete(contentDrafts).where(eq(contentDrafts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Scheduled Content
  async getScheduledContent(id: number): Promise<ScheduledContent | undefined> {
    const [scheduled] = await this.db.select().from(scheduledContent).where(eq(scheduledContent.id, id));
    return scheduled;
  }

  async getAllScheduledContent(): Promise<ScheduledContent[]> {
    return this.db.select().from(scheduledContent).where(eq(scheduledContent.executed, false)).orderBy(asc(scheduledContent.scheduledAt));
  }

  async getPendingScheduledContent(): Promise<ScheduledContent[]> {
    return this.db.select().from(scheduledContent)
      .where(and(eq(scheduledContent.executed, false), lt(scheduledContent.scheduledAt, new Date())))
      .orderBy(asc(scheduledContent.scheduledAt));
  }

  async createScheduledContent(data: InsertScheduledContent): Promise<ScheduledContent> {
    const [scheduled] = await this.db.insert(scheduledContent).values(data).returning();
    return scheduled;
  }

  async markScheduledContentExecuted(id: number): Promise<void> {
    await this.db.update(scheduledContent).set({ executed: true, executedAt: new Date() }).where(eq(scheduledContent.id, id));
  }

  async deleteScheduledContent(id: number): Promise<boolean> {
    const result = await this.db.delete(scheduledContent).where(eq(scheduledContent.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Comment Likes
  async getCommentLikes(commentId: number): Promise<{ likes: number; dislikes: number }> {
    const likes = await this.db.select().from(commentLikes).where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.isLike, true)));
    const dislikes = await this.db.select().from(commentLikes).where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.isLike, false)));
    return { likes: likes.length, dislikes: dislikes.length };
  }

  async getVisitorCommentLike(commentId: number, visitorId: string): Promise<CommentLike | undefined> {
    const [like] = await this.db.select().from(commentLikes).where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.visitorId, visitorId)));
    return like;
  }

  async upsertCommentLike(data: InsertCommentLike): Promise<CommentLike> {
    const existing = await this.getVisitorCommentLike(data.commentId, data.visitorId);
    if (existing) {
      const [updated] = await this.db.update(commentLikes).set({ isLike: data.isLike }).where(eq(commentLikes.id, existing.id)).returning();
      return updated;
    }
    const [like] = await this.db.insert(commentLikes).values(data).returning();
    return like;
  }

  async deleteCommentLike(commentId: number, visitorId: string): Promise<boolean> {
    const result = await this.db.delete(commentLikes).where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.visitorId, visitorId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Comment Reports
  async getCommentReport(id: number): Promise<CommentReport | undefined> {
    const [report] = await this.db.select().from(commentReports).where(eq(commentReports.id, id));
    return report;
  }

  async getAllCommentReports(): Promise<CommentReport[]> {
    return this.db.select().from(commentReports).orderBy(desc(commentReports.createdAt));
  }

  async getPendingCommentReports(): Promise<CommentReport[]> {
    return this.db.select().from(commentReports).where(eq(commentReports.status, 'pending')).orderBy(desc(commentReports.createdAt));
  }

  async createCommentReport(data: InsertCommentReport): Promise<CommentReport> {
    const [report] = await this.db.insert(commentReports).values(data).returning();
    return report;
  }

  async updateCommentReportStatus(id: number, status: string, reviewedBy: number): Promise<CommentReport | undefined> {
    const [report] = await this.db.update(commentReports).set({ status, reviewedBy, reviewedAt: new Date() }).where(eq(commentReports.id, id)).returning();
    return report;
  }

  // Search History
  async createSearchHistory(data: InsertSearchHistory): Promise<SearchHistory> {
    const [history] = await this.db.insert(searchHistory).values(data).returning();
    return history;
  }

  async getPopularSearches(limit: number = 10): Promise<{ query: string; count: number }[]> {
    const results = await this.db.select({
      query: searchHistory.query,
      count: sql<number>`count(*)`
    }).from(searchHistory)
      .groupBy(searchHistory.query)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);
    return results;
  }

  async getUserSearchHistory(userId: number, limit: number = 10): Promise<SearchHistory[]> {
    return this.db.select().from(searchHistory)
      .where(eq(searchHistory.userId, userId))
      .orderBy(desc(searchHistory.createdAt))
      .limit(limit);
  }

  // Page Views / Analytics
  async createPageView(data: InsertPageView): Promise<PageView> {
    const [view] = await this.db.insert(pageViews).values(data).returning();
    return view;
  }

  async getPageViewStats(startDate?: Date, endDate?: Date): Promise<{ path: string; views: number }[]> {
    let query = this.db.select({
      path: pageViews.path,
      views: sql<number>`count(*)`
    }).from(pageViews);

    const conditions = [];
    if (startDate) conditions.push(sql`${pageViews.createdAt} >= ${startDate}`);
    if (endDate) conditions.push(sql`${pageViews.createdAt} <= ${endDate}`);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query.groupBy(pageViews.path).orderBy(desc(sql`count(*)`));
  }

  async getPopularContent(contentType?: string, limit: number = 10): Promise<{ contentId: number; contentType: string; views: number }[]> {
    let query = this.db.select({
      contentId: pageViews.contentId,
      contentType: pageViews.contentType,
      views: sql<number>`count(*)`
    }).from(pageViews).where(sql`${pageViews.contentId} IS NOT NULL`);

    if (contentType) {
      query = query.where(eq(pageViews.contentType, contentType)) as any;
    }

    return query.groupBy(pageViews.contentId, pageViews.contentType).orderBy(desc(sql`count(*)`)).limit(limit) as any;
  }

  async getReferrerStats(limit: number = 10): Promise<{ referrer: string; count: number }[]> {
    return this.db.select({
      referrer: pageViews.referrer,
      count: sql<number>`count(*)`
    }).from(pageViews)
      .where(sql`${pageViews.referrer} IS NOT NULL AND ${pageViews.referrer} != ''`)
      .groupBy(pageViews.referrer)
      .orderBy(desc(sql`count(*)`))
      .limit(limit) as any;
  }

  async getDeviceStats(): Promise<{ device: string; count: number }[]> {
    return this.db.select({
      device: pageViews.device,
      count: sql<number>`count(*)`
    }).from(pageViews)
      .where(sql`${pageViews.device} IS NOT NULL`)
      .groupBy(pageViews.device)
      .orderBy(desc(sql`count(*)`)) as any;
  }

  async getBrowserStats(): Promise<{ browser: string; count: number }[]> {
    return this.db.select({
      browser: pageViews.browser,
      count: sql<number>`count(*)`
    }).from(pageViews)
      .where(sql`${pageViews.browser} IS NOT NULL`)
      .groupBy(pageViews.browser)
      .orderBy(desc(sql`count(*)`)) as any;
  }

  async getCountryStats(): Promise<{ country: string; count: number }[]> {
    return this.db.select({
      country: pageViews.country,
      count: sql<number>`count(*)`
    }).from(pageViews)
      .where(sql`${pageViews.country} IS NOT NULL`)
      .groupBy(pageViews.country)
      .orderBy(desc(sql`count(*)`)) as any;
  }

  // Translations
  async getTranslation(key: string, locale: string): Promise<Translation | undefined> {
    const [translation] = await this.db.select().from(translations).where(and(eq(translations.key, key), eq(translations.locale, locale)));
    return translation;
  }

  async getTranslationsByLocale(locale: string, namespace?: string): Promise<Translation[]> {
    const conditions = [eq(translations.locale, locale)];
    if (namespace) conditions.push(eq(translations.namespace, namespace));
    return this.db.select().from(translations).where(and(...conditions));
  }

  async upsertTranslation(data: InsertTranslation): Promise<Translation> {
    const existing = await this.getTranslation(data.key, data.locale);
    if (existing) {
      const [updated] = await this.db.update(translations).set({ ...data, updatedAt: new Date() }).where(eq(translations.id, existing.id)).returning();
      return updated;
    }
    const [translation] = await this.db.insert(translations).values(data).returning();
    return translation;
  }

  async deleteTranslation(id: number): Promise<boolean> {
    const result = await this.db.delete(translations).where(eq(translations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Content Templates
  async getContentTemplate(id: number): Promise<ContentTemplate | undefined> {
    const [template] = await this.db.select().from(contentTemplates).where(eq(contentTemplates.id, id));
    return template;
  }

  async getAllContentTemplates(): Promise<ContentTemplate[]> {
    return this.db.select().from(contentTemplates).orderBy(desc(contentTemplates.createdAt));
  }

  async getContentTemplatesByType(type: string): Promise<ContentTemplate[]> {
    return this.db.select().from(contentTemplates).where(eq(contentTemplates.type, type)).orderBy(desc(contentTemplates.createdAt));
  }

  async createContentTemplate(data: InsertContentTemplate): Promise<ContentTemplate> {
    const [template] = await this.db.insert(contentTemplates).values(data).returning();
    return template;
  }

  async updateContentTemplate(id: number, data: Partial<InsertContentTemplate>): Promise<ContentTemplate | undefined> {
    const [template] = await this.db.update(contentTemplates).set({ ...data, updatedAt: new Date() }).where(eq(contentTemplates.id, id)).returning();
    return template;
  }

  async deleteContentTemplate(id: number): Promise<boolean> {
    const result = await this.db.delete(contentTemplates).where(eq(contentTemplates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Media Folders
  async getMediaFolder(id: number): Promise<MediaFolder | undefined> {
    const [folder] = await this.db.select().from(mediaFolders).where(eq(mediaFolders.id, id));
    return folder;
  }

  async getAllMediaFolders(): Promise<MediaFolder[]> {
    return this.db.select().from(mediaFolders).orderBy(asc(mediaFolders.path));
  }

  async getChildMediaFolders(parentId: number | null): Promise<MediaFolder[]> {
    if (parentId === null) {
      return this.db.select().from(mediaFolders).where(sql`${mediaFolders.parentId} IS NULL`).orderBy(asc(mediaFolders.name));
    }
    return this.db.select().from(mediaFolders).where(eq(mediaFolders.parentId, parentId)).orderBy(asc(mediaFolders.name));
  }

  async createMediaFolder(data: InsertMediaFolder): Promise<MediaFolder> {
    const [folder] = await this.db.insert(mediaFolders).values(data).returning();
    return folder;
  }

  async deleteMediaFolder(id: number): Promise<boolean> {
    const result = await this.db.delete(mediaFolders).where(eq(mediaFolders.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Media search
  async searchMedia(query: string): Promise<Media[]> {
    return this.db.select().from(media)
      .where(or(
        ilike(media.filename, `%${query}%`),
        ilike(media.originalName, `%${query}%`),
        ilike(media.alt, `%${query}%`)
      ))
      .orderBy(desc(media.createdAt));
  }

  async getMediaByType(mimeTypePrefix: string): Promise<Media[]> {
    return this.db.select().from(media)
      .where(ilike(media.mimeType, `${mimeTypePrefix}%`))
      .orderBy(desc(media.createdAt));
  }

  // Scheduled Tasks
  async getScheduledTask(id: number): Promise<ScheduledTask | undefined> {
    const [task] = await this.db.select().from(scheduledTasks).where(eq(scheduledTasks.id, id));
    return task;
  }

  async getAllScheduledTasks(): Promise<ScheduledTask[]> {
    return this.db.select().from(scheduledTasks).orderBy(desc(scheduledTasks.createdAt));
  }

  async getActiveScheduledTasks(): Promise<ScheduledTask[]> {
    return this.db.select().from(scheduledTasks).where(eq(scheduledTasks.status, "active")).orderBy(asc(scheduledTasks.nextRun));
  }

  async createScheduledTask(data: InsertScheduledTask): Promise<ScheduledTask> {
    const [task] = await this.db.insert(scheduledTasks).values(data).returning();
    return task;
  }

  async updateScheduledTask(id: number, data: Partial<InsertScheduledTask>): Promise<ScheduledTask | undefined> {
    const [task] = await this.db.update(scheduledTasks).set({ ...data, updatedAt: new Date() }).where(eq(scheduledTasks.id, id)).returning();
    return task;
  }

  async updateScheduledTaskRun(id: number, result: 'success' | 'failed', error?: string): Promise<ScheduledTask | undefined> {
    const [task] = await this.db.update(scheduledTasks).set({
      lastRun: new Date(),
      lastResult: result,
      lastError: error || null,
      runCount: sql`${scheduledTasks.runCount} + 1`,
      updatedAt: new Date()
    }).where(eq(scheduledTasks.id, id)).returning();
    return task;
  }

  async deleteScheduledTask(id: number): Promise<boolean> {
    const result = await this.db.delete(scheduledTasks).where(eq(scheduledTasks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getScheduledTask(id: number): Promise<ScheduledTask | undefined> {
    const [task] = await this.db.select().from(scheduledTasks).where(eq(scheduledTasks.id, id));
    return task;
  }

  async getAllScheduledTasks(): Promise<ScheduledTask[]> {
    return this.db.select().from(scheduledTasks).orderBy(desc(scheduledTasks.createdAt));
  }

  async getActiveScheduledTasks(): Promise<ScheduledTask[]> {
    return this.db.select().from(scheduledTasks).where(eq(scheduledTasks.status, "active")).orderBy(desc(scheduledTasks.createdAt));
  }

  async createScheduledTask(data: InsertScheduledTask): Promise<ScheduledTask> {
    const [task] = await this.db.insert(scheduledTasks).values(data).returning();
    return task;
  }

  // Webhooks
  async getWebhook(id: number): Promise<Webhook | undefined> {
    const [webhook] = await this.db.select().from(webhooks).where(eq(webhooks.id, id));
    return webhook;
  }

  async getAllWebhooks(): Promise<Webhook[]> {
    return this.db.select().from(webhooks).orderBy(desc(webhooks.createdAt));
  }

  async getActiveWebhooks(): Promise<Webhook[]> {
    return this.db.select().from(webhooks).where(eq(webhooks.status, "active"));
  }

  async getWebhooksByEvent(event: string): Promise<Webhook[]> {
    return this.db.select().from(webhooks)
      .where(and(
        eq(webhooks.status, "active"),
        sql`${webhooks.events}::jsonb ? ${event}`
      ));
  }

  async createWebhook(data: InsertWebhook): Promise<Webhook> {
    const [webhook] = await this.db.insert(webhooks).values(data).returning();
    return webhook;
  }

  async updateWebhook(id: number, data: Partial<InsertWebhook>): Promise<Webhook | undefined> {
    const [webhook] = await this.db.update(webhooks).set({ ...data, updatedAt: new Date() }).where(eq(webhooks.id, id)).returning();
    return webhook;
  }

  async incrementWebhookSuccess(id: number): Promise<void> {
    await this.db.update(webhooks).set({
      lastTriggered: new Date(),
      successCount: sql`${webhooks.successCount} + 1`,
      updatedAt: new Date()
    }).where(eq(webhooks.id, id));
  }

  async incrementWebhookFailure(id: number): Promise<void> {
    await this.db.update(webhooks).set({
      lastTriggered: new Date(),
      failureCount: sql`${webhooks.failureCount} + 1`,
      updatedAt: new Date()
    }).where(eq(webhooks.id, id));
  }

  async deleteWebhook(id: number): Promise<boolean> {
    await this.db.delete(webhookLogs).where(eq(webhookLogs.webhookId, id));
    const result = await this.db.delete(webhooks).where(eq(webhooks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Webhook Logs
  async getWebhookLog(id: number): Promise<WebhookLog | undefined> {
    const [log] = await this.db.select().from(webhookLogs).where(eq(webhookLogs.id, id));
    return log;
  }

  async getWebhookLogs(webhookId: number, limit: number = 50): Promise<WebhookLog[]> {
    return this.db.select().from(webhookLogs)
      .where(eq(webhookLogs.webhookId, webhookId))
      .orderBy(desc(webhookLogs.createdAt))
      .limit(limit);
  }

  async getAllWebhookLogs(limit: number = 100): Promise<WebhookLog[]> {
    return this.db.select().from(webhookLogs).orderBy(desc(webhookLogs.createdAt)).limit(limit);
  }

  async createWebhookLog(data: InsertWebhookLog): Promise<WebhookLog> {
    const [log] = await this.db.insert(webhookLogs).values(data).returning();
    return log;
  }

  async deleteWebhookLogs(webhookId: number): Promise<boolean> {
    const result = await this.db.delete(webhookLogs).where(eq(webhookLogs.webhookId, webhookId));
    return (result.rowCount ?? 0) > 0;
  }

  // Get daily page views for analytics
  async getDailyPageViews(days: number = 30): Promise<{ date: string; views: number; visitors: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const result = await this.db.select({
      date: sql<string>`DATE(${pageViews.createdAt})`,
      views: sql<number>`COUNT(*)`,
      visitors: sql<number>`COUNT(DISTINCT ${pageViews.visitorId})`
    }).from(pageViews)
      .where(sql`${pageViews.createdAt} >= ${startDate}`)
      .groupBy(sql`DATE(${pageViews.createdAt})`)
      .orderBy(sql`DATE(${pageViews.createdAt})`);
    
    return result as any;
  }

  // Get all translations
  async getAllTranslations(): Promise<Translation[]> {
    return this.db.select().from(translations).orderBy(translations.locale, translations.namespace, translations.key);
  }

  // Get translations by key (all locales)
  async getTranslationsByKey(key: string): Promise<Translation[]> {
    return this.db.select().from(translations).where(eq(translations.key, key));
  }

  // Bulk upsert translations
  async bulkUpsertTranslations(data: InsertTranslation[]): Promise<Translation[]> {
    const results: Translation[] = [];
    for (const t of data) {
      const result = await this.upsertTranslation(t);
      results.push(result);
    }
    return results;
  }
}

export const storage = new DatabaseStorage();