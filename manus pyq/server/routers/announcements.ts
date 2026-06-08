import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { announcements, reports, papers } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { logAuditAction, getReports, getPaperById } from "../db";

export const announcementsRouter = router({
  /**
   * Create announcement (admin only)
   */
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        type: z.enum(["notice", "circular", "exam_alert", "update"]),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const result = await db.insert(announcements).values({
        title: input.title,
        content: input.content,
        type: input.type,
        priority: input.priority,
        createdBy: ctx.user!.id,
      });

      await logAuditAction(
        "announcement_created",
        ctx.user!.id,
        undefined,
        "announcement",
        result[0].insertId,
        { title: input.title }
      );

      return { success: true, announcementId: result[0].insertId };
    }),

  /**
   * Get all announcements
   */
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(announcements)
        .where(eq(announcements.isVisible, true))
        .orderBy(desc(announcements.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  /**
   * Get announcement by ID
   */
  getById: protectedProcedure
    .input(z.object({ announcementId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(announcements)
        .where(and(eq(announcements.id, input.announcementId), eq(announcements.isVisible, true)))
        .limit(1);

      return result.length > 0 ? result[0] : null;
    }),

  /**
   * Delete announcement (admin only)
   */
  delete: adminProcedure
    .input(z.object({ announcementId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.update(announcements).set({ isVisible: false }).where(eq(announcements.id, input.announcementId));

      await logAuditAction(
        "announcement_deleted",
        ctx.user!.id,
        undefined,
        "announcement",
        input.announcementId
      );

      return { success: true };
    }),

  /**
   * Report a paper (student only)
   */
  reportPaper: protectedProcedure
    .input(
      z.object({
        paperId: z.number(),
        reason: z.enum(["wrong_subject", "wrong_semester", "duplicate", "corrupted_file", "other"]),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const paper = await getPaperById(input.paperId);
      if (!paper) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Paper not found" });
      }

      // Check if already reported by this user
      const existing = await db
        .select()
        .from(reports)
        .where(
          and(
            eq(reports.paperId, input.paperId),
            eq(reports.reportedBy, ctx.user!.id),
            eq(reports.status, "pending")
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You have already reported this paper" });
      }

      const result = await db.insert(reports).values({
        paperId: input.paperId,
        reportedBy: ctx.user!.id,
        reason: input.reason,
        description: input.description,
      });

      return { success: true, reportId: result[0].insertId };
    }),

  /**
   * Get reports (admin only)
   */
  getReports: adminProcedure
    .input(
      z.object({
        status: z.enum(["pending", "resolved", "rejected"]).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await getReports(input.status, input.limit, input.offset);
    }),

  /**
   * Resolve report (admin only)
   */
  resolveReport: adminProcedure
    .input(
      z.object({
        reportId: z.number(),
        status: z.enum(["resolved", "rejected"]),
        resolutionNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const report = await db.select().from(reports).where(eq(reports.id, input.reportId)).limit(1);

      if (report.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      }

      await db
        .update(reports)
        .set({
          status: input.status,
          resolutionNotes: input.resolutionNotes,
          resolvedBy: ctx.user!.id,
          resolvedAt: new Date(),
        })
        .where(eq(reports.id, input.reportId));

      await logAuditAction(
        "report_resolved",
        ctx.user!.id,
        undefined,
        "report",
        input.reportId,
        { status: input.status }
      );

      return { success: true };
    }),

  /**
   * Get report by ID (admin only)
   */
  getReportById: adminProcedure
    .input(z.object({ reportId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db.select().from(reports).where(eq(reports.id, input.reportId)).limit(1);

      return result.length > 0 ? result[0] : null;
    }),
});
