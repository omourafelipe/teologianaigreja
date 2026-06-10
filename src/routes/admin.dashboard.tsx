import { createFileRoute, Link } from "@tanstack/react-router";
import { useLmsStore } from "@/hooks/useLmsStore";
import { FolderKanban, FileText, Tags, BookOpen, ArrowRight, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { courses, categories, lessons, modules } = useLmsStore();

  const totalCourses = courses.length;
  const totalCategories = categories.length;
  const totalLessons = lessons.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">
          Olá, Professor!
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Painel de controle para gerenciar seus cursos teológicos e lições.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Courses Stat */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-900 dark:bg-blue-950/50 dark:text-blue-400">
              <FolderKanban className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cursos
              </p>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {totalCourses}
              </h3>
            </div>
          </div>
        </div>

        {/* Lessons Stat */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Lições
              </p>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {totalLessons}
              </h3>
            </div>
          </div>
        </div>

        {/* Categories Stat */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <Tags className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Categorias
              </p>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {totalCategories}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Actions & Recent */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <div className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40">
          <h2 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-100">
            Ações Rápidas
          </h2>
          <p className="mt-1 text-[10px] text-slate-500">
            Comece a estruturar novos conteúdos para a igreja.
          </p>

          <div className="mt-4 grid gap-3">
            <Link
              to="/admin/courses"
              className="flex items-center justify-between rounded-lg border border-slate-200/70 p-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
            >
              <div className="text-left">
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Gerenciar Cursos
                </span>
                <span className="block text-[10px] text-slate-450 mt-0.5">
                  Adicionar, editar metadados ou excluir cursos
                </span>
              </div>
              <Plus className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/courses"
              className="flex items-center justify-between rounded-lg border border-slate-200/70 p-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
            >
              <div className="text-left">
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Gerenciar Categorias
                </span>
                <span className="block text-[10px] text-slate-450 mt-0.5">
                  Criar tópicos temáticos flexíveis
                </span>
              </div>
              <Plus className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Recent Courses List */}
        <div className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-100">
              Meus Cursos
            </h2>
            <Link
              to="/admin/courses"
              className="inline-flex items-center gap-0.5 text-xs text-blue-900 dark:text-blue-400 hover:underline"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 flex-1 space-y-3">
            {courses.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-800">
                Nenhum curso cadastrado ainda.
              </div>
            ) : (
              courses.slice(0, 3).map((course) => {
                const categoryName = categories.find((c) => c.id === course.category_id)?.name || "Sem Categoria";
                const courseMods = modules.filter((m) => m.course_id === course.id);
                const modIds = courseMods.map((m) => m.id);
                const courseLessonsCount = lessons.filter((l) => modIds.includes(l.module_id)).length;

                return (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded bg-slate-100 p-1.5 dark:bg-slate-800">
                        <BookOpen className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-850 dark:text-slate-200">
                          {course.title}
                        </h4>
                        <span className="block text-[10px] text-slate-450 mt-0.5">
                          {categoryName} · {courseMods.length} Módulo(s) · {courseLessonsCount} Lição(ões)
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/admin/course/$courseId/builder"
                      params={{ courseId: course.id }}
                      className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Editar Estrutura"
                    >
                      <ArrowRight className="h-4 w-4 text-slate-400 hover:text-blue-900 dark:hover:text-blue-400 transition" />
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
