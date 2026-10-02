import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { AppInitializer } from "@/components/AppInitializer";

export const metadata: Metadata = {
  title: "F-Physics | Học Vật lý lớp 10, 11, 12",
  description:
    "Học Vật lý THPT lớp 10, 11, 12 theo chương trình GDPT 2018. Khám phá kiến thức, luyện tập theo chủ đề và học cùng gia sư AI từng bước.",
  keywords: [
    "vật lý lớp 12",
    "vật lý lớp 10",
    "vật lý lớp 11",
    "chương trình GDPT 2018",
    "AI tutor",
    "gia sư vật lý",
    "luyện thi THPT",
    "physics learning",
    "F-Physics",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" data-scroll-behavior="smooth" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('f-physics-theme') === 'dark' ? 'dark' : 'light';
                  document.documentElement.setAttribute('data-theme', t);
                  var l = localStorage.getItem('f-physics-lang') || 'vi';
                  document.documentElement.setAttribute('lang', l);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen" style={{ fontFamily: "'Google Sans', system-ui, sans-serif" }}>
        <AppInitializer />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

