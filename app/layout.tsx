import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./components/ThemeProvider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kanbai - AI-Powered Kanban Board",
  description:
    "AI-powered Kanban Board for tasks & productivity. Organize your work smarter with intelligent task management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Charlie+Display:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistMono.variable} antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "dark:!bg-surface dark:!text-text-primary dark:!border-border",
              style: {
                background: "var(--surface)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              },
              success: {
                iconTheme: {
                  primary: "var(--accent-green)",
                  secondary: "#fff",
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
