import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Course } from "@/data/mockData";

export function CourseAccordion({ course }: { course: Course }) {
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(course.modules.map((m) => [m.id, true])),
  );
  return (
    <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950/40">
      {course.modules.map((m) => (
        <div key={m.id}>
          <button
            onClick={() => setOpen((o) => ({ ...o, [m.id]: !o[m.id] }))}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-serif text-base font-semibold text-slate-900 dark:text-slate-100">
              {m.title}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-slate-500 transition-transform ${open[m.id] ? "rotate-180" : ""}`}
            />
          </button>
          {open[m.id] && (
            <ul className="pb-3">
              {m.lessons.map((l, i) => (
                <li key={l.id}>
                  <Link
                    to="/course/$courseId/lesson/$lessonId"
                    params={{ courseId: course.id, lessonId: l.id }}
                    className="flex items-baseline gap-3 px-5 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-blue-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-blue-400"
                  >
                    <span className="w-6 text-xs tabular-nums text-slate-400">{i + 1}.</span>
                    <span>{l.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
