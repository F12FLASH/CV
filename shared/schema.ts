import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for admin authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("Subscriber"),
  status: text("status").notNull().default("Active"),
  avatar: text("avatar"),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  passwordUpdatedAt: timestamp("password_updated_at").defaultNow(),
  passwordExpiresAt: timestamp("password_expires_at"),
  lastActive: timestamp("last_active").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  image: text("image"),
  shortDescription: text("short_description"),
  description: text("description"),
  tech: jsonb("tech").$type<string[]>().default([]),
  link: text("link"),
  github: text("github"),
  status: text("status").notNull().default("Draft"),
  views: integer("views").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Posts table - blog posts
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  category: text("category").notNull(),
  author: text("author").notNull(),
  status: text("status").notNull().default("Draft"),
  views: integer("views").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  featuredImage: text("featured_image"),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  publishedAt: timestamp("published_at"),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Skills table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  level: integer("level").notNull().default(0),
  icon: text("icon"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
});
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

// Services table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon"),
  features: jsonb("features").$type<string[]>().default([]),
  price: text("price"),
  order: integer("order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Testimonials table
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role"),
  company: text("company"),
  content: text("content").notNull(),
  avatar: text("avatar"),
  rating: integer("rating").notNull().default(5),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// Messages table - contact form submissions
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sender: text("sender").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  tag: text("tag"),
  read: boolean("read").notNull().default(false),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  read: true,
  archived: true,
  createdAt: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  userId: integer("user_id"),
  userName: text("user_name"),
  type: text("type").notNull().default("info"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  type: text("type").notNull().default("system"),
  read: boolean("read").notNull().default(false),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  read: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Site settings table
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Media table
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  alt: text("alt"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
});
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof media.$inferSelect;

// Comments table - for blog posts and projects
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  authorAvatar: text("author_avatar"),
  postId: integer("post_id"),
  projectId: integer("project_id"),
  parentId: integer("parent_id"),
  status: text("status").notNull().default("Pending"),
  read: boolean("read").notNull().default(false),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  read: true,
  archived: true,
  createdAt: true,
});
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Reviews table - for projects
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  authorAvatar: text("author_avatar"),
  projectId: integer("project_id").notNull(),
  rating: integer("rating").notNull().default(5),
  status: text("status").notNull().default("Pending"),
  read: boolean("read").notNull().default(false),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  read: true,
  archived: true,
  createdAt: true,
});
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  activityLogs: many(activityLogs),
  notifications: many(notifications),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  project: one(projects, {
    fields: [comments.projectId],
    references: [projects.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "replies",
  }),
  replies: many(comments, { relationName: "replies" }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  project: one(projects, {
    fields: [reviews.projectId],
    references: [projects.id],
  }),
}));

export const postsRelations = relations(posts, ({ many }) => ({
  comments: many(comments),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  comments: many(comments),
  reviews: many(reviews),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Security Settings table
export const securitySettings = pgTable("security_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSecuritySettingSchema = createInsertSchema(securitySettings).omit({
  id: true,
  updatedAt: true,
});
export type InsertSecuritySetting = z.infer<typeof insertSecuritySettingSchema>;
export type SecuritySetting = typeof securitySettings.$inferSelect;

// Trusted Devices table
export const trustedDevices = pgTable("trusted_devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deviceName: text("device_name").notNull(),
  deviceFingerprint: text("device_fingerprint"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  trusted: boolean("trusted").notNull().default(true),
  lastUsed: timestamp("last_used").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTrustedDeviceSchema = createInsertSchema(trustedDevices).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
});
export type InsertTrustedDevice = z.infer<typeof insertTrustedDeviceSchema>;
export type TrustedDevice = typeof trustedDevices.$inferSelect;

// User Sessions table
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: integer("user_id").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceInfo: text("device_info"),
  location: text("location"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
  lastActivity: true,
});
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;

// IP Whitelist/Blacklist table
export const ipRules = pgTable("ip_rules", {
  id: serial("id").primaryKey(),
  ipAddress: text("ip_address").notNull(),
  type: text("type").notNull(), // 'whitelist' or 'blacklist'
  reason: text("reason"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIpRuleSchema = createInsertSchema(ipRules).omit({
  id: true,
  createdAt: true,
});
export type InsertIpRule = z.infer<typeof insertIpRuleSchema>;
export type IpRule = typeof ipRules.$inferSelect;

// Pages table - custom CMS pages
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  status: text("status").notNull().default("Draft"),
  views: integer("views").notNull().default(0),
  featuredImage: text("featured_image"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  publishedAt: timestamp("published_at"),
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pages.$inferSelect;

// Security Logs table (for bot detection, threat events, login history)
export const securityLogs = pgTable("security_logs", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // 'bot_blocked', 'ddos_attempt', 'sql_injection', 'xss_attempt', 'login_failed', 'login_success'
  action: text("action"), // Human readable description of the action
  userId: integer("user_id"),
  userName: text("user_name"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  requestPath: text("request_path"),
  requestBody: text("request_body"),
  blocked: boolean("blocked").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSecurityLogSchema = createInsertSchema(securityLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertSecurityLog = z.infer<typeof insertSecurityLogSchema>;
export type SecurityLog = typeof securityLogs.$inferSelect;

// Homepage Sections - manage visibility of sections on homepage
export const homepageSections = pgTable("homepage_sections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // 'projects', 'blog', 'testimonials', etc.
  visible: boolean("visible").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHomepageSectionSchema = createInsertSchema(homepageSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertHomepageSection = z.infer<typeof insertHomepageSectionSchema>;
export type HomepageSection = typeof homepageSections.$inferSelect;

// FAQs table
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  visible: boolean("visible").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFAQSchema = createInsertSchema(faqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFAQ = z.infer<typeof insertFAQSchema>;
export type FAQ = typeof faqs.$inferSelect;

// WebAuthn Credentials table (for biometric login)
export const webauthnCredentials = pgTable("webauthn_credentials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  credentialId: text("credential_id").notNull().unique(),
  publicKey: text("public_key").notNull(),
  counter: integer("counter").notNull().default(0),
  deviceName: text("device_name"),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used"),
});

export const insertWebAuthnCredentialSchema = createInsertSchema(webauthnCredentials).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
});
export type InsertWebAuthnCredential = z.infer<typeof insertWebAuthnCredentialSchema>;
export type WebAuthnCredential = typeof webauthnCredentials.$inferSelect;

// Relations for security tables
export const trustedDevicesRelations = relations(trustedDevices, ({ one }) => ({
  user: one(users, {
    fields: [trustedDevices.userId],
    references: [users.id],
  }),
}));

export const webauthnCredentialsRelations = relations(webauthnCredentials, ({ one }) => ({
  user: one(users, {
    fields: [webauthnCredentials.userId],
    references: [users.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const ipRulesRelations = relations(ipRules, ({ one }) => ({
  createdByUser: one(users, {
    fields: [ipRules.createdBy],
    references: [users.id],
  }),
}));

// Password Reset Tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  used: true,
  createdAt: true,
});
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Newsletter Subscribers table
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  status: text("status").notNull().default("active"), // active, unsubscribed, bounced
  source: text("source").default("website"),
  tags: jsonb("tags").$type<string[]>().default([]),
  unsubscribeToken: text("unsubscribe_token"),
  confirmedAt: timestamp("confirmed_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
  createdAt: true,
});
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

// Email Templates table
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  type: text("type").notNull().default("newsletter"), // newsletter, notification, transactional
  variables: jsonb("variables").$type<string[]>().default([]),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

// Email Campaigns table
export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  templateId: integer("template_id"),
  status: text("status").notNull().default("draft"), // draft, scheduled, sending, sent, cancelled
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({
  id: true,
  openCount: true,
  clickCount: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;

// Content Versions table (for version control)
export const contentVersions = pgTable("content_versions", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(), // post, page, project
  contentId: integer("content_id").notNull(),
  version: integer("version").notNull().default(1),
  title: text("title").notNull(),
  content: text("content"),
  metadata: jsonb("metadata"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContentVersionSchema = createInsertSchema(contentVersions).omit({
  id: true,
  createdAt: true,
});
export type InsertContentVersion = z.infer<typeof insertContentVersionSchema>;
export type ContentVersion = typeof contentVersions.$inferSelect;

// Content Drafts table (for auto-save)
export const contentDrafts = pgTable("content_drafts", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(), // post, page, project
  contentId: integer("content_id"), // null for new content
  title: text("title"),
  content: text("content"),
  metadata: jsonb("metadata"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContentDraftSchema = createInsertSchema(contentDrafts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertContentDraft = z.infer<typeof insertContentDraftSchema>;
export type ContentDraft = typeof contentDrafts.$inferSelect;

// Scheduled Content table
export const scheduledContent = pgTable("scheduled_content", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(), // post, page
  contentId: integer("content_id").notNull(),
  action: text("action").notNull(), // publish, unpublish
  scheduledAt: timestamp("scheduled_at").notNull(),
  executed: boolean("executed").notNull().default(false),
  executedAt: timestamp("executed_at"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScheduledContentSchema = createInsertSchema(scheduledContent).omit({
  id: true,
  executed: true,
  executedAt: true,
  createdAt: true,
});
export type InsertScheduledContent = z.infer<typeof insertScheduledContentSchema>;
export type ScheduledContent = typeof scheduledContent.$inferSelect;

// Comment Likes table
export const commentLikes = pgTable("comment_likes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull(),
  visitorId: text("visitor_id").notNull(), // IP hash or session ID
  isLike: boolean("is_like").notNull(), // true = like, false = dislike
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentLikeSchema = createInsertSchema(commentLikes).omit({
  id: true,
  createdAt: true,
});
export type InsertCommentLike = z.infer<typeof insertCommentLikeSchema>;
export type CommentLike = typeof commentLikes.$inferSelect;

// Comment Reports table
export const commentReports = pgTable("comment_reports", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull(),
  reason: text("reason").notNull(),
  reporterEmail: text("reporter_email"),
  status: text("status").notNull().default("pending"), // pending, reviewed, dismissed
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentReportSchema = createInsertSchema(commentReports).omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
});
export type InsertCommentReport = z.infer<typeof insertCommentReportSchema>;
export type CommentReport = typeof commentReports.$inferSelect;

// Search History table
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  resultsCount: integer("results_count").default(0),
  visitorId: text("visitor_id"),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  createdAt: true,
});
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

// Page Views / Analytics table
export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  contentType: text("content_type"), // post, page, project
  contentId: integer("content_id"),
  visitorId: text("visitor_id").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  country: text("country"),
  city: text("city"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  sessionDuration: integer("session_duration"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  createdAt: true,
});
export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type PageView = typeof pageViews.$inferSelect;

// Translations table (for i18n)
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  locale: text("locale").notNull(),
  value: text("value").notNull(),
  namespace: text("namespace").default("common"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

// Content Templates table
export const contentTemplates = pgTable("content_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // post, page
  content: text("content"),
  metadata: jsonb("metadata"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContentTemplateSchema = createInsertSchema(contentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertContentTemplate = z.infer<typeof insertContentTemplateSchema>;
export type ContentTemplate = typeof contentTemplates.$inferSelect;

// Media Folders table
export const mediaFolders = pgTable("media_folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
  path: text("path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaFolderSchema = createInsertSchema(mediaFolders).omit({
  id: true,
  createdAt: true,
});
export type InsertMediaFolder = z.infer<typeof insertMediaFolderSchema>;
export type MediaFolder = typeof mediaFolders.$inferSelect;

// Relations for new tables
export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const emailCampaignsRelations = relations(emailCampaigns, ({ one }) => ({
  template: one(emailTemplates, {
    fields: [emailCampaigns.templateId],
    references: [emailTemplates.id],
  }),
}));

export const contentVersionsRelations = relations(contentVersions, ({ one }) => ({
  creator: one(users, {
    fields: [contentVersions.createdBy],
    references: [users.id],
  }),
}));

export const contentDraftsRelations = relations(contentDrafts, ({ one }) => ({
  user: one(users, {
    fields: [contentDrafts.userId],
    references: [users.id],
  }),
}));

export const scheduledContentRelations = relations(scheduledContent, ({ one }) => ({
  creator: one(users, {
    fields: [scheduledContent.createdBy],
    references: [users.id],
  }),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(comments, {
    fields: [commentLikes.commentId],
    references: [comments.id],
  }),
}));

export const commentReportsRelations = relations(commentReports, ({ one }) => ({
  comment: one(comments, {
    fields: [commentReports.commentId],
    references: [comments.id],
  }),
  reviewer: one(users, {
    fields: [commentReports.reviewedBy],
    references: [users.id],
  }),
}));

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  user: one(users, {
    fields: [searchHistory.userId],
    references: [users.id],
  }),
}));

export const mediaFoldersRelations = relations(mediaFolders, ({ one, many }) => ({
  parent: one(mediaFolders, {
    fields: [mediaFolders.parentId],
    references: [mediaFolders.id],
    relationName: "children",
  }),
  children: many(mediaFolders, { relationName: "children" }),
}));