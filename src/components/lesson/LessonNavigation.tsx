import { Link } from "@tanstack/react-router";

interface FlatLesson {
  lesson: {
    id: string;
    title: string;
  };
  moduleId: string;
  moduleTitle: string;
}

interface LessonNavigationProps {
  prev: FlatLesson | null | undefined;
  next: FlatLesson | null | undefined;
}

export function LessonNavigation({ prev, next }: LessonNavigationProps) {
  return (
    <nav className="mt-16 flex items-center justify-between gap-4 border-t border-slate-200/80 pt-6 dark:border-slate-850">
      {prev ? (
        <Link
          to="/lesson/$lessonId"
          params={{ lessonId: prev.lesson.id }}
          className="group flex-1 rounded-lg border border-slate-250 p-4 text-left transition hover:border-blue-900/40 dark:border-slate-800 dark:hover:border-blue-400/40"
        >
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            ← Anterior
          </div>
          <div className="mt-1 text-xs font-bold text-slate-800 group-hover:text-blue-900 dark:text-slate-200 dark:group-hover:text-blue-400">
            {prev.lesson.title}
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          to="/lesson/$lessonId"
          params={{ lessonId: next.lesson.id }}
          className="group flex-1 rounded-lg border border-slate-250 p-4 text-right transition hover:border-blue-900/40 dark:border-slate-800 dark:hover:border-blue-400/40"
        >
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Próxima →
          </div>
          <div className="mt-1 text-xs font-bold text-slate-800 group-hover:text-blue-900 dark:text-slate-200 dark:group-hover:text-blue-400">
            {next.lesson.title}
          </div>
        </Link>
      ) : (
        <div className="flex-1 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Fim do Curso
        </div>
      )}
    </nav>
  );
}
