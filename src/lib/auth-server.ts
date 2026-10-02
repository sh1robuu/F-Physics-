import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            // In production, replace with real email service (Resend, SendGrid, etc.)
            console.log(`[PASSWORD_RESET] Email to: ${user.email}`);
            console.log(`[PASSWORD_RESET] Reset URL: ${url}`);
            // For now, log to console. In production:
            // await resend.emails.send({ to: user.email, subject: "Reset password", html: `<a href="${url}">Reset</a>` });
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "STUDENT",
                input: false,
            },
        },
    },
});
