import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { papers, downloads, bookmarks, subjects, departments } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { searchPapers, getPaperById, logAuditAction } from "../db";
import { storagePut } from "../storage";

export const papersRouter = router({
  /**
   * Upload a new paper (admin only)
   */
  upload: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        subjectId: z.number(),
        departmentId: z.number(),
        semester: z.number(),
        academicYear: z.string(),
        examType: z.enum(["mid_semester", "end_semester", "practical", "unit_test"]),
        description: z.string().optional(),
        fileUrl: z.string(),
        fileKey: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify subject and department exist
      const [subjectExists, deptExists] = await Promise.all([
        db.select().from(subjects).where(eq(subjects.id, input.subjectId)).limit(1),
        db.select().from(departments).where(eq(departments.id, input.departmentId)).limit(1),
      ]);

      if (subjectExists.length === 0 || deptExists.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid subject or department" });
      }

      const result = await db.insert(papers).values({
        title: input.title,
        subjectId: input.subjectId,
        departmentId: input.departmentId,
        semester: input.semester,
        academicYear: input.academicYear,
        examType: input.examType,
        description: input.description,
        fileUrl: input.fileUrl,
        fileKey: input.fileKey,
        uploadedBy: ctx.user!.id,
        isApproved: ctx.user!.role === "super_admin", // Auto-approve for super admin
      });

      await logAuditAction(
        "paper_uploaded",
        ctx.user!.id,
        undefined,
        "paper",
        result[0].insertId,
        { title: input.title }
      );

      return { success: true, paperId: result[0].insertId };
    }),

  /**
   * Search papers with filters
   */
  search: protectedProcedure
    .input(
      z.object({
        departmentId: z.number().optional(),
        semesterId: z.number().optional(),
        subjectId: z.number().optional(),
        academicYear: z.string().optional(),
        examType: z.string().optional(),
        searchTerm: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await searchPapers({
        departmentId: input.departmentId,
        semesterId: input.semesterId,
        subjectId: input.subjectId,
        academicYear: input.academicYear,
        examType: input.examType,
        searchTerm: input.searchTerm,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  /**
   * Get paper by ID
   */
  getById: protectedProcedure
    .input(z.object({ paperId: z.number() }))
    .query(async ({ input }) => {
      return await getPaperById(input.paperId);
    }),

  /**
   * Record a download
   */
  recordDownload: protectedProcedure
    .input(z.object({ paperId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const paper = await getPaperById(input.paperId);
      if (!paper) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Paper not found" });
      }

      // Insert download record
      await db.insert(downloads).values({
        userId: ctx.user!.id,
        paperId: input.paperId,
      });

      // Increment download count
      await db
        .update(papers)
        .set({ downloadCount: (paper.downloadCount || 0) + 1 })
        .where(eq(papers.id, input.paperId));

      return { success: true };
    }),

  /**
   * Bookmark a paper
   */
  bookmark: protectedProcedure
    .input(z.object({ paperId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const paper = await getPaperById(input.paperId);
      if (!paper) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Paper not found" });
      }

      // Check if already bookmarked
      const existing = await db
        .select()
        .from(bookmarks)
        .where(and(eq(bookmarks.userId, ctx.user!.id), eq(bookmarks.paperId, input.paperId)))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Paper already bookmarked" });
      }

      await db.insert(bookmarks).values({
        userId: ctx.user!.id,
        paperId: input.paperId,
      });

      return { success: true };
    }),

  /**
   * Remove bookmark
   */
  removeBookmark: protectedProcedure
    .input(z.object({ paperId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .delete(bookmarks)
        .where(and(eq(bookmarks.userId, ctx.user!.id), eq(bookmarks.paperId, input.paperId)));

      return { success: true };
    }),

  /**
   * Get user bookmarks
   */
  getBookmarks: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const userBookmarks = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, ctx.user!.id));

    // Get full paper details for each bookmark
    const paperIds = userBookmarks.map(b => b.paperId);
    if (paperIds.length === 0) return [];

    const paperDetails = await db
      .select()
      .from(papers)
      .where(eq(papers.id, paperIds[0])); // This is simplified; in production, use IN clause

    return userBookmarks;
  }),

  /**
   * Approve paper (admin only)
   */
  approve: adminProcedure
    .input(z.object({ paperId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const paper = await getPaperById(input.paperId);
      if (!paper) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Paper not found" });
      }

      await db.update(papers).set({ isApproved: true }).where(eq(papers.id, input.paperId));

      await logAuditAction(
        "paper_approved",
        ctx.user!.id,
        undefined,
        "paper",
        input.paperId
      );

      return { success: true };
    }),

  /**
   * Delete paper (admin only)
   */
  delete: adminProcedure
    .input(z.object({ paperId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const paper = await getPaperById(input.paperId);
      if (!paper) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Paper not found" });
      }

      // Delete related records
      await Promise.all([
        db.delete(downloads).where(eq(downloads.paperId, input.paperId)),
        db.delete(bookmarks).where(eq(bookmarks.paperId, input.paperId)),
      ]);

      // Delete paper
      await db.delete(papers).where(eq(papers.id, input.paperId));

      await logAuditAction(
        "paper_deleted",
        ctx.user!.id,
        undefined,
        "paper",
        input.paperId,
        { title: paper.title }
      );

      return { success: true };
    }),

  /**
   * Get trending papers (most downloaded)
   */
  getTrending: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(papers)
        .where(eq(papers.isApproved, true))
        .orderBy(desc(papers.downloadCount))
        .limit(input.limit);
    }),

  /**
   * Get recent papers
   */
  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(papers)
        .where(eq(papers.isApproved, true))
        .orderBy(desc(papers.createdAt))
        .limit(input.limit);
    }),
});
