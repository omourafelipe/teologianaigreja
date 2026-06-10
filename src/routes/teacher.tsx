import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { GraduationCap, LayoutDashboard, FolderKanban, Tags, ArrowLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export const Route = createFileRoute("/teacher")({
  component: TeacherLayout,
});

function TeacherLayout() {
  const { theme, toggle } = useTheme();
  const location = useLocation();

  const menuItems = [
    {
      to: "/teacher",
      label: "Painel Geral",
      icon: LayoutDashboard,
      active: location.pathname === "/teacher"
    },
    {
      to: "/teacher/courses",
      label: "Gerenciar Cursos",
      icon: FolderKanban,
      active: location.pathname.startsWith("/teacher/courses")
    },
    {
      to: "/teacher/categories",
      label: "Categorias",
      icon: Tags,
      active: location.pathname === "/teacher/categories"
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-200">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200/80 bg-white/70 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/60 lg:block">
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <Link
            to="/teacher"
            className="flex items-center gap-2 font-serif text-lg font-bold tracking-tight text-blue-900 dark:text-blue-400"
          >
            <GraduationCap className="h-5 w-5" />
            <span>Painel EBD</span>
          </Link>
        </div>

        <nav className="space-y-1 px-4 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  item.active
                    ? "bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-400 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Ver Biblioteca
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-6 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Logo visible only on mobile */}
            <Link
              to="/teacher"
              className="flex items-center gap-2 font-serif text-md font-bold text-blue-900 dark:text-blue-400 lg:hidden"
            >
              <GraduationCap className="h-5 w-5" />
              <span>Painel EBD</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile links */}
            <nav className="flex items-center gap-1.5 mr-2 lg:hidden">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    className={`rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 ${
                      item.active ? "bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-400" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
              <Link
                to="/"
                title="Biblioteca"
                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </nav>

            <button
              onClick={toggle}
              aria-label="Alternar tema"
              className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
