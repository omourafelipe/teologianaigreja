import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban, Plus, Trash2, Edit, BookOpen } from "lucide-react";
import { useCourseStore } from "@/hooks/useCourseStore";

export const Route = createFileRoute("/teacher/courses")({
  component: TeacherCourses,
});

function TeacherCourses() {
  const { courses, deleteCourse } = useCourseStore();

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir o curso "${title}"? Todas as lições associadas serão perdidas.`)) {
      deleteCourse(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Gerenciar Cursos
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Crie, edite e organize os cursos disponíveis na biblioteca.
          </p>
        </div>
        <Link
          to="/teacher/courses/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300"
        >
          <Plus className="h-4 w-4" /> Novo Curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200/80 p-8 text-center dark:border-slate-800/80">
          <FolderKanban className="h-10 w-10 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Nenhum curso</h3>
          <p className="mt-1 text-xs text-slate-500">Crie seu primeiro curso para começar a adicionar lições.</p>
          <Link
            to="/teacher/courses/new"
            className="mt-4 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900"
          >
            Adicionar Curso
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {courses.map((c) => {
            const lessonsCount = c.modules.reduce((acc, m) => acc + m.lessons.length, 0);
            return (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-900 dark:bg-blue-950/40 dark:text-blue-400">
                      {c.category}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {c.modules.length} módulo(s) · {lessonsCount} lição(ões)
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif text-lg font-bold text-slate-800 dark:text-slate-200">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2">
                    {c.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/60">
                  <Link
                    to="/teacher/courses/$courseId"
                    params={{ courseId: c.id }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <BookOpen className="h-4 w-4" /> Gerenciar Aulas
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDelete(c.id, c.title)}
                      className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition dark:hover:bg-red-950/20"
                      title="Excluir Curso"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
