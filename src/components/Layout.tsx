import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { BookOpen, Moon, Sun, GraduationCap, LogOut, User } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLmsStore } from "@/hooks/useLmsStore";

export function Layout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const { currentUser, logout } = useLmsStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  // Roteamento de proteção de sessão
  useEffect(() => {
    if (!currentUser && !isAuthPage && typeof window !== "undefined") {
      navigate({ to: "/login" });
    }
  }, [currentUser, isAuthPage]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const isTeacher = currentUser?.role === "teacher";
  const isAdminArea = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-900 dark:text-slate-200">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-slate-50/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link 
            to={isTeacher && isAdminArea ? "/admin/dashboard" : "/dashboard"} 
            className="flex items-center gap-2 font-serif text-lg font-semibold tracking-tight text-blue-900 dark:text-blue-400"
          >
            <BookOpen className="h-5 w-5" />
            <span>Teologia na Igreja</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-3">
                {/* Nome do usuário e badge */}
                <div className="hidden md:flex flex-col items-end text-right">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {currentUser.name}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold mt-0.5 ${
                    isTeacher 
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" 
                      : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                  }`}>
                    {isTeacher ? "Professor" : "Aluno"}
                  </span>
                </div>

                {/* Alternador de painel (Professor <=> Aluno) */}
                {isTeacher && (
                  <Link
                    to={isAdminArea ? "/dashboard" : "/admin/dashboard"}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-650 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 dark:hover:bg-slate-900"
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{isAdminArea ? "Ver como Aluno" : "Painel Admin"}</span>
                  </Link>
                )}

                {/* Botão de Logout */}
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-655 dark:hover:bg-slate-800 transition"
                  title="Sair da Conta"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}

            <button
              onClick={toggle}
              aria-label="Alternar tema"
              className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mx-auto max-w-5xl px-6 py-10 text-center text-xs text-slate-500 dark:text-slate-500">
        EBD Digital · Leitura com calma e profundidade.
      </footer>
    </div>
  );
}
