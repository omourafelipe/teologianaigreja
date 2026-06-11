import { Link } from "@tanstack/react-router";
import { ChevronDown, XCircle, CheckCircle } from "lucide-react";
import type { Course, Lesson, Profile, Module } from "@/types/database.types";

interface LessonSidebarProps {
  course: Course;
  currentLesson: Lesson;
  currentUser: Profile;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  openModules: Record<string, boolean>;
  toggleModuleCollapse: (modId: string) => void;
  getCourseModules: (courseId: string) => Module[];
  getModuleLessons: (moduleId: string) => Lesson[];
  getLessonProgress: (userId: string, lessonId: string) => any;
}

export function LessonSidebar({
  course,
  currentLesson,
  currentUser,
  isSidebarOpen,
  setIsSidebarOpen,
  openModules,
  toggleModuleCollapse,
  getCourseModules,
  getModuleLessons,
  getLessonProgress,
}: LessonSidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200 bg-slate-50 p-4 transition-all duration-300 dark:border-slate-800 dark:bg-slate-950/60 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:-ml-64"
      }`}
    >
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Ementa do Curso
          </span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded p-1 hover:bg-slate-200 lg:hidden dark:hover:bg-slate-850"
          >
            <XCircle className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <Link
          to="/course/$courseId"
          params={{ courseId: course.id }}
          className="font-serif text-sm font-bold text-slate-800 hover:text-blue-900 dark:text-slate-200 dark:hover:text-blue-400 truncate block"
        >
          {course.title}
        </Link>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {getCourseModules(course.id).map((m) => {
            const isOpen = !!openModules[m.id];
            const moduleLessons = getModuleLessons(m.id);

            return (
              <div key={m.id} className="space-y-1">
                <button
                  onClick={() => toggleModuleCollapse(m.id)}
                  className="flex w-full items-center justify-between text-left text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <span className="truncate">{m.title}</span>
                  <ChevronDown
                    className={`h-3 w-3 shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <ul className="pl-2.5 border-l border-slate-200 dark:border-slate-800 space-y-1">
                    {moduleLessons.map((l) => {
                      const isCurrent = l.id === currentLesson.id;
                      const isCompleted = getLessonProgress(currentUser.id, l.id)?.is_completed;

                      return (
                        <li key={l.id}>
                          <Link
                            to="/lesson/$lessonId"
                            params={{ lessonId: l.id }}
                            className={`group flex items-center justify-between gap-1.5 rounded px-2.5 py-1.5 text-[11px] transition ${
                              isCurrent
                                ? "bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-400 font-semibold"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-850 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200"
                            }`}
                          >
                            <span className="truncate">{l.title}</span>
                            {isCompleted && (
                              <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-450 shrink-0" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
