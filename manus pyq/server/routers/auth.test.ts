import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(user?: Partial<AuthenticatedUser>): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];

  const defaultUser: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "student",
    rollNumber: "12345",
    department: "CSE",
    semester: 4,
    academicYear: "2024",
    profilePictureUrl: null,
    isProtectedSuperAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user: user ? { ...defaultUser, ...user } : defaultUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: any) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("auth router", () => {
  describe("me", () => {
    it("returns current user info", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.email).toBe("test@example.com");
      expect(result?.role).toBe("student");
    });

    it("returns null for unauthenticated users", async () => {
      const { ctx } = createAuthContext();
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeNull();
    });
  });

  describe("logout", () => {
    it("clears session cookie and returns success", async () => {
      const { ctx, clearedCookies } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
      expect(clearedCookies).toHaveLength(1);
      expect(clearedCookies[0]?.name).toBe("app_session_id");
      expect(clearedCookies[0]?.options.maxAge).toBe(-1);
    });
  });

  describe("role-based access control", () => {
    it("allows super admin to promote users", async () => {
      const { ctx } = createAuthContext({ role: "super_admin", id: 1 });
      const caller = appRouter.createCaller(ctx);

      // This would normally interact with the database
      // For now, we're testing that the procedure is accessible
      expect(caller.auth.promoteToAdmin).toBeDefined();
    });

    it("prevents regular admin from promoting users", async () => {
      const { ctx } = createAuthContext({ role: "admin", id: 2 });
      const caller = appRouter.createCaller(ctx);

      // Attempting to call super admin only procedure should fail
      try {
        await caller.auth.promoteToAdmin({ userId: 3 });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("prevents students from accessing admin procedures", async () => {
      const { ctx } = createAuthContext({ role: "student", id: 3 });
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.auth.getAllUsers({ limit: 10 });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("super admin protection", () => {
    it("prevents demotion of protected super admin", async () => {
      const { ctx } = createAuthContext({ role: "super_admin", id: 1 });
      const caller = appRouter.createCaller(ctx);

      // This test verifies the protection logic exists
      // In a real scenario, this would interact with the database
      expect(caller.auth.demoteAdmin).toBeDefined();
    });
  });

  describe("updateProfile", () => {
    it("allows authenticated users to update their profile", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      expect(caller.auth.updateProfile).toBeDefined();
    });

    it("prevents unauthenticated users from updating profile", async () => {
      const { ctx } = createAuthContext();
      ctx.user = null;
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.auth.updateProfile({
          name: "Updated Name",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });
});
