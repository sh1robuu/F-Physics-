import { auth } from "@/lib/auth-server";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;
export const POST = async (req: Request) => {
    try {
        return await handler.POST(req);
    } catch (error) {
        console.error("[AUTH_ERROR]", error);
        return new Response(
            JSON.stringify({ error: "Internal server error", details: String(error) }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
