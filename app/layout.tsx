import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { I18nProvider } from "@/components/I18nProvider";
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
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const l=localStorage.getItem("locale");if(l)document.documentElement.lang=l}catch{}`
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <I18nProvider>
          <Header />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
