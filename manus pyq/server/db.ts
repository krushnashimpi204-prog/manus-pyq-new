import { eq, and, or, like, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  collegeAccessCodes,
  departments,
  subjects,
  papers,
  downloads,
  bookmarks,
  reports,
  announcements,
  chats,
  chatParticipants,
  messages,
  userSessions,
  auditLogs,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Upsert user with college-specific fields
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "rollNumber", "department", "academicYear", "profilePictureUrl"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.semester !== undefined) {
      values.semester = user.semester;
      updateSet.semester = user.semester;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "super_admin";
      updateSet.role = "super_admin";
      values.isProtectedSuperAdmin = true;
      updateSet.isProtectedSuperAdmin = true;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * Get user by openId
 */
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Verify college access code
 */
export async function verifyCollegeAccessCode(code: string) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(collegeAccessCodes)
    .where(
      and(
        eq(collegeAccessCodes.code, code),
        eq(collegeAccessCodes.isActive, true)
      )
    )
    .limit(1);

  if (result.length === 0) return false;

  const accessCode = result[0];
  if (accessCode.expiresAt && accessCode.expiresAt < new Date()) {
    return false;
  }

  return true;
}

/**
 * Get all departments
 */
export async function getDepartments() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(departments);
}

/**
 * Get subjects by department
 */
export async function getSubjectsByDepartment(departmentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(subjects).where(eq(subjects.departmentId, departmentId));
}

/**
 * Search papers with filters
 */
export async function searchPapers(filters: {
  departmentId?: number;
  semesterId?: number;
  subjectId?: number;
  academicYear?: string;
  examType?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters.departmentId) {
    conditions.push(eq(papers.departmentId, filters.departmentId));
  }
  if (filters.semesterId) {
    conditions.push(eq(papers.semester, filters.semesterId));
  }
  if (filters.subjectId) {
    conditions.push(eq(papers.subjectId, filters.subjectId));
  }
  if (filters.academicYear) {
    conditions.push(eq(papers.academicYear, filters.academicYear));
  }
  if (filters.examType) {
    conditions.push(eq(papers.examType, filters.examType as any));
  }
  if (filters.searchTerm) {
    conditions.push(
      or(
        like(papers.title, `%${filters.searchTerm}%`),
        like(papers.description, `%${filters.searchTerm}%`)
      )
    );
  }

  let query = db.select().from(papers);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  query = query.orderBy(desc(papers.createdAt)) as any;

  if (filters.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
}

/**
 * Get paper by ID
 */
export async function getPaperById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(papers).where(eq(papers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user download history
 */
export async function getUserDownloadHistory(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(downloads)
    .where(eq(downloads.userId, userId))
    .orderBy(desc(downloads.downloadedAt))
    .limit(limit);
}

/**
 * Get user bookmarks
 */
export async function getUserBookmarks(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(bookmarks).where(eq(bookmarks.userId, userId));
}

/**
 * Get announcements
 */
export async function getAnnouncements(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(announcements)
    .where(eq(announcements.isVisible, true))
    .orderBy(desc(announcements.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get reports for admin
 */
export async function getReports(status?: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(reports);

  if (status) {
    query = query.where(eq(reports.status, status as any)) as any;
  }

  return await (query.orderBy(desc(reports.createdAt)).limit(limit).offset(offset) as any);
}

/**
 * Get user sessions
 */
export async function getUserSession(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userSessions).where(eq(userSessions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get chat by ID with participants
 */
export async function getChatWithParticipants(chatId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const chat = await db.select().from(chats).where(eq(chats.id, chatId)).limit(1);
  if (chat.length === 0) return undefined;

  const participants = await db.select().from(chatParticipants).where(eq(chatParticipants.chatId, chatId));

  return {
    ...chat[0],
    participants,
  };
}

/**
 * Get chat messages
 */
export async function getChatMessages(chatId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Log audit action
 */
export async function logAuditAction(
  actionType: string,
  performedBy: number,
  targetUserId?: number,
  targetResourceType?: string,
  targetResourceId?: number,
  details?: Record<string, any>
) {
  const db = await getDb();
  if (!db) return;

  await db.insert(auditLogs).values({
    actionType,
    performedBy,
    targetUserId,
    targetResourceType,
    targetResourceId,
    details: details ? JSON.stringify(details) : null,
  });
}

/**
 * Get total statistics for admin dashboard
 */
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const [totalStudents, totalAdmins, totalPapers, totalDownloads, totalReports, totalAnnouncements] = await Promise.all([
    db.select().from(users).where(eq(users.role, "student")),
    db.select().from(users).where(or(eq(users.role, "admin"), eq(users.role, "super_admin"))),
    db.select().from(papers),
    db.select().from(downloads),
    db.select().from(reports),
    db.select().from(announcements),
  ]);

  return {
    totalStudents: totalStudents.length,
    totalAdmins: totalAdmins.length,
    totalPapers: totalPapers.length,
    totalDownloads: totalDownloads.length,
    totalReports: totalReports.length,
    totalAnnouncements: totalAnnouncements.length,
  };
}
