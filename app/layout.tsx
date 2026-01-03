import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${APP_NAME} | Save Time, Recover Revenue`,
  description:
    "AI-powered business solutions that save you time and recover lost revenue. Never miss a call, booking, or opportunity again.",
  keywords: ["AI", "business", "automation", "restaurants", "booking", "reservation"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col ai-pattern">
          {/* Header */}
          <header className="glass sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow-blue group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold gradient-text">{APP_NAME}</span>
              </a>
              <nav className="flex items-center gap-6">
                <a
                  href="/industries"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  Industries
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                </a>
              </nav>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t border-border/50 py-8 mt-auto glass">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p className="gradient-text font-medium">© {new Date().getFullYear()} {APP_NAME}</p>
              <p className="mt-2 opacity-60">
                Helping businesses save time and recover revenue through AI.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
