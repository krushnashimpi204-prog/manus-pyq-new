import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { papersRouter } from "./routers/papers";
import { announcementsRouter } from "./routers/announcements";
import { dashboardRouter } from "./routers/dashboard";
import { contactRouter } from "./routers/contact";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: authRouter,
  papers: papersRouter,
  announcements: announcementsRouter,
  dashboard: dashboardRouter,
  contact: contactRouter,
});

export type AppRouter = typeof appRouter;
