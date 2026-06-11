import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useLmsStore } from "@/hooks/useLmsStore";
import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  ArrowLeft,
  UserCheck,
  HelpCircle,
  BarChart2,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { currentUser } = useLmsStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isTeacher = currentUser?.role === "teacher";
  const isBuilder = location.pathname.includes("/builder");

  useEffect(() => {
    // If not a teacher, redirect to student dashboard
    if (currentUser && currentUser.role !== "teacher") {
      navigate({ to: "/dashboard" });
    }
  }, [currentUser, navigate]);

  // If not logged in, Layout component will handle login redirection
  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-sm text-slate-400">Verificando credenciais...</div>
      </div>
    );
  }

  // If logged in but not a teacher, show access restricted message (while redirecting)
  if (!isTeacher) {
    return (
      <Layout>
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          <div className="inline-flex rounded-full bg-red-100 p-3 text-red-655 dark:bg-red-950/30 dark:text-red-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-serif text-xl font-bold text-slate-900 dark:text-slate-100">
            Acesso Restrito
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Esta área é destinada apenas a professores. Você está sendo redirecionado para a
            biblioteca...
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar para Biblioteca
          </Link>
        </div>
      </Layout>
    );
  }

  // If it's the course builder, render without the admin sidebar for full-width workspace
  if (isBuilder) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </Layout>
    );
  }

  const menuItems = [
    {
      to: "/admin/dashboard",
      label: "Painel Geral",
      icon: LayoutDashboard,
      active: location.pathname === "/admin/dashboard" || location.pathname === "/admin",
    },
    {
      to: "/admin/courses",
      label: "Gerenciar Cursos",
      icon: FolderKanban,
      active: location.pathname.startsWith("/admin/courses"),
    },
    {
      to: "/admin/users",
      label: "Gestão de Alunos",
      icon: UserCheck,
      active: location.pathname === "/admin/users",
    },
    {
      to: "/admin/questions",
      label: "Banco de Questões",
      icon: HelpCircle,
      active: location.pathname === "/admin/questions",
    },
    {
      to: "/admin/analytics",
      label: "Analytics & Evasão",
      icon: BarChart2,
      active: location.pathname === "/admin/analytics",
    },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Admin Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40">
              <span className="block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                Administração
              </span>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        item.active
                          ? "bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-400 font-bold"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Admin Page Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </Layout>
  );
}
