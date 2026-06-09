import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import type { Course } from "@/data/mockData";

interface Props {
  course: Course;
  currentLessonId: string;
  open: boolean;
  onClose: () => void;
}

export function SidebarDrawer({ course, currentLessonId, open, onClose }: Props) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto border-r border-slate-200 bg-slate-50 p-6 shadow-xl transition-transform dark:border-slate-800 dark:bg-slate-900 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-blue-900 dark:text-blue-400">
              {course.category}
            </div>
            <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-100">
              {course.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
            aria-label="Fechar índice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="space-y-5">
          {course.modules.map((m) => (
            <div key={m.id}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500">
                {m.title}
              </div>
              <ul className="space-y-1">
                {m.lessons.map((l) => {
                  const active = l.id === currentLessonId;
                  return (
                    <li key={l.id}>
                      <Link
                        to="/course/$courseId/lesson/$lessonId"
                        params={{ courseId: course.id, lessonId: l.id }}
                        onClick={onClose}
                        className={`block rounded-md px-3 py-2 text-sm transition ${
                          active
                            ? "bg-blue-900/10 font-medium text-blue-900 dark:bg-blue-400/10 dark:text-blue-400"
                            : "text-slate-700 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        {l.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
