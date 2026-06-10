import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban, Tags, FileText, Plus, ArrowRight, BookOpen } from "lucide-react";
import { useCourseStore } from "@/hooks/useCourseStore";

export const Route = createFileRoute("/teacher/")({
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const { courses, categories } = useCourseStore();

  const totalCourses = courses.length;
  const totalCategories = categories.length;
  const totalLessons = courses.reduce(
    (acc, course) =>
      acc + course.modules.reduce((mAcc, m) => mAcc + m.lessons.length, 0),
    0
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Olá, Professor!
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Bem-vindo ao centro de controle da sua Escola Bíblica Digital.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/40">
          <div className="flex items-center gap-3.5">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-900 dark:bg-blue-950/50 dark:text-blue-400">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Cursos
              </p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {totalCourses}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/40">
          <div className="flex items-center gap-3.5">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Lições
              </p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {totalLessons}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/40">
          <div className="flex items-center gap-3.5">
            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <Tags className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Categorias
              </p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {totalCategories}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Actions & Recent */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900/40">
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-100">
            Ações Rápidas
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Comece a estruturar novos conteúdos para a igreja.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              to="/teacher/courses"
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:border-blue-900/40 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-blue-400/40 dark:hover:bg-slate-950/40"
            >
              <div className="text-left">
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Criar Curso
                </span>
                <span className="mt-0.5 block text-[10px] text-slate-400">
                  Novo título e categoria
                </span>
              </div>
              <Plus className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/teacher/categories"
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:border-blue-900/40 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-blue-400/40 dark:hover:bg-slate-950/40"
            >
              <div className="text-left">
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Nova Categoria
                </span>
                <span className="mt-0.5 block text-[10px] text-slate-400">
                  Organize por assunto
                </span>
              </div>
              <Plus className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900/40">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-100">
              Meus Cursos
            </h2>
            <Link
              to="/teacher/courses"
              className="inline-flex items-center gap-1 text-xs text-blue-900 hover:underline dark:text-blue-400"
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
              courses.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded bg-slate-100 p-1.5 dark:bg-slate-800">
                      <BookOpen className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {course.title}
                      </h4>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                        {course.category} · {course.modules.length} Módulo(s)
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/teacher/courses/$courseId"
                    params={{ courseId: course.id }}
                    className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Editar Curso"
                  >
                    <ArrowRight className="h-4 w-4 text-slate-400 hover:text-blue-900 dark:hover:text-blue-400" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
