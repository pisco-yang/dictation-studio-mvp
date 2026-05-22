import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dictation Studio",
  description: "Turn uploaded audio and video into interactive dictation lessons."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem("theme");const d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch{}`
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-30 border-b border-line bg-surface/82 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-accent text-sm text-white dark:text-slate-950">
                DS
              </span>
              <span className="hidden sm:inline">Dictation Studio</span>
            </Link>
            <div className="flex items-center gap-1 text-sm sm:gap-2">
              <Link href="/dashboard" className="rounded-md px-3 py-2 text-muted transition hover:bg-accentSoft hover:text-ink">
                Dashboard
              </Link>
              <Link href="/create" className="rounded-md bg-ink px-3 py-2 text-paper transition hover:opacity-85">
                Create
              </Link>
              <ThemeToggle />
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
