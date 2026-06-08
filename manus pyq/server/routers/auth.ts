import { z } from "zod";
import { publicProcedure, protectedProcedure, adminProcedure, superAdminProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { 
  verifyCollegeAccessCode, 
  getUserById, 
  logAuditAction,
  getUserByOpenId,
  upsertUser,
} from "../db";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { COOKIE_NAME } from "../../shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

export const authRouter = router({
  /**
   * Verify college access code before registration
   */
  verifyAccessCode: publicProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const isValid = await verifyCollegeAccessCode(input.code);
      return { isValid };
    }),

  /**
   * Get current user info
   */
  me: publicProcedure.query(opts => opts.ctx.user),

  /**
   * Logout user
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        rollNumber: z.string().optional(),
        department: z.string().optional(),
        semester: z.number().optional(),
        academicYear: z.string().optional(),
        profilePictureUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.rollNumber !== undefined) updateData.rollNumber = input.rollNumber;
      if (input.department !== undefined) updateData.department = input.department;
      if (input.semester !== undefined) updateData.semester = input.semester;
      if (input.academicYear !== undefined) updateData.academicYear = input.academicYear;
      if (input.profilePictureUrl !== undefined) updateData.profilePictureUrl = input.profilePictureUrl;

      await db.update(users).set(updateData).where(eq(users.id, ctx.user!.id));

      return { success: true };
    }),

  /**
   * Promote user to admin (super admin only)
   */
  promoteToAdmin: superAdminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const targetUser = await getUserById(input.userId);
      if (!targetUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Prevent promoting protected super admin
      if (targetUser.isProtectedSuperAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot modify protected super admin" });
      }

      await db.update(users).set({ role: "admin" }).where(eq(users.id, input.userId));

      await logAuditAction(
        "promote_to_admin",
        ctx.user!.id,
        input.userId,
        "user",
        input.userId,
        { previousRole: targetUser.role }
      );

      return { success: true };
    }),

  /**
   * Demote admin to student (super admin only)
   */
  demoteAdmin: superAdminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const targetUser = await getUserById(input.userId);
      if (!targetUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Prevent demoting protected super admin
      if (targetUser.isProtectedSuperAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot modify protected super admin" });
      }

      if (targetUser.role !== "admin") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User is not an admin" });
      }

      await db.update(users).set({ role: "student" }).where(eq(users.id, input.userId));

      await logAuditAction(
        "demote_admin",
        ctx.user!.id,
        input.userId,
        "user",
        input.userId,
        { previousRole: targetUser.role }
      );

      return { success: true };
    }),

  /**
   * Get all users (admin only)
   */
  getAllUsers: adminProcedure
    .input(
      z.object({
        role: z.enum(["super_admin", "admin", "student"]).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(users);

      if (input.role) {
        query = query.where(eq(users.role, input.role)) as any;
      }

      const result = await (query.limit(input.limit).offset(input.offset) as any);
      return result;
    }),

  /**
   * Get user by ID (admin only)
   */
  getUserById: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return await getUserById(input.userId);
    }),
});
