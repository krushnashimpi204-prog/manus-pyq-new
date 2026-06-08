import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";
import { TRPCError } from "@trpc/server";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export const contactRouter = router({
  submitForm: publicProcedure
    .input(contactFormSchema)
    .mutation(async ({ input }) => {
      try {
        // Validate input
        const validatedInput = contactFormSchema.parse(input);

        // Notify the owner about the contact form submission
        const notificationSent = await notifyOwner({
          title: `New Contact Form Submission from ${validatedInput.name}`,
          content: `
Email: ${validatedInput.email}
Subject: ${validatedInput.subject}

Message:
${validatedInput.message}
          `.trim(),
        });

        if (!notificationSent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send notification",
          });
        }

        return {
          success: true,
          message: "Thank you for contacting us. We'll get back to you soon!",
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const firstError = error.issues[0];
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: firstError?.message || "Validation failed",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit contact form",
        });
      }
    }),
});
