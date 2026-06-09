import { Link } from "@tanstack/react-router";
import { BookOpen, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";

export function Layout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-900 dark:text-slate-200">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-slate-50/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-serif text-lg font-semibold tracking-tight text-blue-900 dark:text-blue-400">
            <BookOpen className="h-5 w-5" />
            <span>EBD Digital</span>
          </Link>
          <button
            onClick={toggle}
            aria-label="Alternar tema"
            className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mx-auto max-w-5xl px-6 py-10 text-center text-xs text-slate-500 dark:text-slate-500">
        EBD Digital · Leitura com calma e profundidade.
      </footer>
    </div>
  );
}
