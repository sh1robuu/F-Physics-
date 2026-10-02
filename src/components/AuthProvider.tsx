"use client";

import { createContext, useContext, ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type Session = typeof authClient.$Infer.Session;

interface AuthError {
    error?: string;
    code?: string;
}

interface AuthContextType {
    user: Session["user"] | null;
    session: Session["session"] | null;
    isLoading: boolean;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthError>;
    signup: (name: string, email: string, password: string) => Promise<AuthError>;
    logout: () => Promise<void>;
}

// Map Better Auth error codes/messages to Vietnamese user-friendly messages
function mapAuthError(error: { message?: string; code?: string; status?: number } | null): AuthError {
    if (!error) return {};

    const code = error.code || "UNKNOWN";
    const status = error.status;
    const msg = (error.message || "").toLowerCase();

    // Map known error patterns
    if (code === "INVALID_EMAIL_OR_PASSWORD" || msg.includes("invalid email or password") || msg.includes("invalid credentials")) {
        return { error: "Email hoặc mật khẩu không đúng", code: "AUTH_INVALID_CREDENTIALS" };
    }
    if (code === "USER_NOT_FOUND" || msg.includes("user not found")) {
        return { error: "Tài khoản không tồn tại", code: "AUTH_USER_NOT_FOUND" };
    }
    if (code === "USER_ALREADY_EXISTS" || msg.includes("already exists") || msg.includes("already registered")) {
        return { error: "Email này đã được đăng ký", code: "AUTH_EMAIL_EXISTS" };
    }
    if (code === "WEAK_PASSWORD" || msg.includes("password") && msg.includes("weak")) {
        return { error: "Mật khẩu quá yếu. Hãy dùng ít nhất 8 ký tự", code: "AUTH_WEAK_PASSWORD" };
    }
    if (code === "INVALID_EMAIL" || msg.includes("invalid email")) {
        return { error: "Địa chỉ email không hợp lệ", code: "AUTH_INVALID_EMAIL" };
    }
    if (code === "TOO_MANY_REQUESTS" || msg.includes("rate limit") || msg.includes("too many")) {
        return { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút", code: "AUTH_RATE_LIMITED" };
    }
    if (code === "EMAIL_NOT_VERIFIED" || msg.includes("email not verified")) {
        return { error: "Email chưa được xác minh. Kiểm tra hộp thư", code: "AUTH_EMAIL_NOT_VERIFIED" };
    }
    if (code === "SESSION_EXPIRED" || msg.includes("session expired")) {
        return { error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại", code: "AUTH_SESSION_EXPIRED" };
    }

    // Status-based fallbacks
    if (status === 401) {
        return { error: "Thông tin xác thực không hợp lệ", code: "AUTH_UNAUTHORIZED" };
    }
    if (status === 403) {
        return { error: "Bạn không có quyền truy cập", code: "AUTH_FORBIDDEN" };
    }
    if (status === 429) {
        return { error: "Quá nhiều yêu cầu. Thử lại sau", code: "AUTH_RATE_LIMITED" };
    }
    if (status && status >= 500) {
        return { error: "Lỗi máy chủ. Vui lòng thử lại sau", code: "AUTH_SERVER_ERROR" };
    }

    // Fallback — include the raw message for debugging
    return {
        error: error.message || "Đã xảy ra lỗi không xác định",
        code: `AUTH_${code}`,
    };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: sessionData, isPending } = authClient.useSession();
    const router = useRouter();

    const login = async (email: string, password: string, rememberMe?: boolean): Promise<AuthError> => {
        try {
            const { error } = await authClient.signIn.email({
                email,
                password,
                rememberMe: rememberMe ?? true,
            });
            if (error) {
                console.error("[Auth Login]", error);
                return mapAuthError(error);
            }
            router.push("/dashboard");
            sessionStorage.setItem("f-physics-just-logged-in", "true");
            return {};
        } catch (err) {
            console.error("[Auth Login] Unexpected:", err);
            return { error: "Không thể kết nối đến máy chủ", code: "AUTH_NETWORK_ERROR" };
        }
    };

    const signup = async (name: string, email: string, password: string): Promise<AuthError> => {
        try {
            const { error } = await authClient.signUp.email({
                email,
                password,
                name,
            });
            if (error) {
                console.error("[Auth Signup]", error);
                return mapAuthError(error);
            }
            router.push("/dashboard");
            sessionStorage.setItem("f-physics-just-signed-up", "true");
            return {};
        } catch (err) {
            console.error("[Auth Signup] Unexpected:", err);
            return { error: "Không thể kết nối đến máy chủ", code: "AUTH_NETWORK_ERROR" };
        }
    };

    const logout = async () => {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => router.push("/"),
                },
            });
        } catch (err) {
            console.error("[Auth Logout]", err);
            router.push("/");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user: sessionData?.user ?? null,
                session: sessionData?.session ?? null,
                isLoading: isPending,
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
