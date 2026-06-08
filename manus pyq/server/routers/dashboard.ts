import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import {
  users,
  papers,
  downloads,
  announcements,
  reports,
  bookmarks,
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { getDashboardStats, getUserDownloadHistory, getUserBookmarks } from "../db";

export const dashboardRouter = router({
  /**
   * Get admin dashboard statistics
   */
  getAdminStats: adminProcedure.query(async ({ ctx }) => {
    return await getDashboardStats();
  }),

  /**
   * Get downloads by month (for charts)
   */
  getDownloadsByMonth: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    // Get downloads from last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const allDownloads = await db
      .select()
      .from(downloads)
      .where(eq(downloads.downloadedAt, twelveMonthsAgo));

    // Group by month
    const monthlyData: Record<string, number> = {};
    allDownloads.forEach(d => {
      const month = new Date(d.downloadedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      downloads: count,
    }));
  }),

  /**
   * Get papers by department
   */
  getPapersByDepartment: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const allPapers = await db.select().from(papers);

    // Group by department
    const deptData: Record<string, number> = {};
    allPapers.forEach(p => {
      const key = `Dept ${p.departmentId}`;
      deptData[key] = (deptData[key] || 0) + 1;
    });

    return Object.entries(deptData).map(([department, count]) => ({
      department,
      papers: count,
    }));
  }),

  /**
   * Get active users count
   */
  getActiveUsers: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return 0;

    // Get users who have logged in within last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await db
      .select()
      .from(users)
      .where(eq(users.lastSignedIn, thirtyDaysAgo));

    return activeUsers.length;
  }),

  /**
   * Get student dashboard data
   */
  getStudentDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const userId = ctx.user!.id;

    // Get recent papers
    const recentPapers = await db
      .select()
      .from(papers)
      .where(eq(papers.isApproved, true))
      .orderBy(desc(papers.createdAt))
      .limit(5);

    // Get recent announcements
    const recentAnnouncements = await db
      .select()
      .from(announcements)
      .where(eq(announcements.isVisible, true))
      .orderBy(desc(announcements.createdAt))
      .limit(5);

    // Get download history
    const downloadHistory = await getUserDownloadHistory(userId, 5);

    // Get bookmarks
    const userBookmarks = await getUserBookmarks(userId);

    return {
      recentPapers,
      recentAnnouncements,
      downloadHistory,
      bookmarks: userBookmarks,
    };
  }),

  /**
   * Get user profile for dashboard
   */
  getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  /**
   * Get download statistics for user
   */
  getUserDownloadStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { totalDownloads: 0, thisMonth: 0, thisWeek: 0 };

    const userId = ctx.user!.id;

    // Total downloads
    const totalDownloads = await db
      .select()
      .from(downloads)
      .where(eq(downloads.userId, userId));

    // This month
    const monthStart = new Date();
    monthStart.setDate(1);
    const thisMonth = totalDownloads.filter(
      d => new Date(d.downloadedAt) >= monthStart
    ).length;

    // This week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const thisWeek = totalDownloads.filter(
      d => new Date(d.downloadedAt) >= weekStart
    ).length;

    return {
      totalDownloads: totalDownloads.length,
      thisMonth,
      thisWeek,
    };
  }),

  /**
   * Get pending reports count (admin only)
   */
  getPendingReportsCount: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return 0;

    const pendingReports = await db
      .select()
      .from(reports)
      .where(eq(reports.status, "pending"));

    return pendingReports.length;
  }),

  /**
   * Get pending papers count (admin only)
   */
  getPendingPapersCount: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return 0;

    const pendingPapers = await db
      .select()
      .from(papers)
      .where(eq(papers.isApproved, false));

    return pendingPapers.length;
  }),
});
