import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  datetime,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow with extended fields for college PYQ system.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["super_admin", "admin", "student"]).default("student").notNull(),
  
  // College-specific fields
  rollNumber: varchar("rollNumber", { length: 50 }),
  department: varchar("department", { length: 100 }),
  semester: int("semester"),
  academicYear: varchar("academicYear", { length: 20 }),
  profilePictureUrl: text("profilePictureUrl"),
  
  // Super admin protection flag
  isProtectedSuperAdmin: boolean("isProtectedSuperAdmin").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * College access codes table for registration gating.
 */
export const collegeAccessCodes = mysqlTable("collegeAccessCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type CollegeAccessCode = typeof collegeAccessCodes.$inferSelect;
export type InsertCollegeAccessCode = typeof collegeAccessCodes.$inferInsert;

/**
 * Departments table for organizing papers.
 */
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

/**
 * Subjects table for organizing papers by subject.
 */
export const subjects = mysqlTable("subjects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  departmentId: int("departmentId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;

/**
 * Previous Year Question papers table.
 */
export const papers = mysqlTable("papers", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subjectId: int("subjectId").notNull(),
  departmentId: int("departmentId").notNull(),
  semester: int("semester").notNull(),
  academicYear: varchar("academicYear", { length: 20 }).notNull(),
  examType: mysqlEnum("examType", ["mid_semester", "end_semester", "practical", "unit_test"]).notNull(),
  description: text("description"),
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  uploadedBy: int("uploadedBy").notNull(),
  downloadCount: int("downloadCount").default(0).notNull(),
  isApproved: boolean("isApproved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Paper = typeof papers.$inferSelect;
export type InsertPaper = typeof papers.$inferInsert;

/**
 * Downloads tracking table.
 */
export const downloads = mysqlTable("downloads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  paperId: int("paperId").notNull(),
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
});

export type Download = typeof downloads.$inferSelect;
export type InsertDownload = typeof downloads.$inferInsert;

/**
 * Bookmarks/Saved papers table.
 */
export const bookmarks = mysqlTable("bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  paperId: int("paperId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = typeof bookmarks.$inferInsert;

/**
 * Paper reports table for student reporting system.
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  paperId: int("paperId").notNull(),
  reportedBy: int("reportedBy").notNull(),
  reason: mysqlEnum("reason", [
    "wrong_subject",
    "wrong_semester",
    "duplicate",
    "corrupted_file",
    "other"
  ]).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "resolved", "rejected"]).default("pending").notNull(),
  resolvedBy: int("resolvedBy"),
  resolutionNotes: text("resolutionNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Announcements table for admin notices and updates.
 */
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["notice", "circular", "exam_alert", "update"]).notNull(),
  createdBy: int("createdBy").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  isVisible: boolean("isVisible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * Chat groups/conversations table.
 */
export const chats = mysqlTable("chats", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }),
  isGroupChat: boolean("isGroupChat").default(false).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chat = typeof chats.$inferSelect;
export type InsertChat = typeof chats.$inferInsert;

/**
 * Chat participants table.
 */
export const chatParticipants = mysqlTable("chatParticipants", {
  id: int("id").autoincrement().primaryKey(),
  chatId: int("chatId").notNull(),
  userId: int("userId").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type InsertChatParticipant = typeof chatParticipants.$inferInsert;

/**
 * Chat messages table.
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  chatId: int("chatId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * User online status tracking.
 */
export const userSessions = mysqlTable("userSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  isOnline: boolean("isOnline").default(false).notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
});

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

/**
 * Audit log table for tracking role changes and admin actions.
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  actionType: varchar("actionType", { length: 100 }).notNull(),
  performedBy: int("performedBy").notNull(),
  targetUserId: int("targetUserId"),
  targetResourceType: varchar("targetResourceType", { length: 100 }),
  targetResourceId: int("targetResourceId"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
