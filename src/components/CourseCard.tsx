import { Link } from "@tanstack/react-router";
import type { Course } from "@/data/mockData";

export function CourseCard({ course }: { course: Course }) {
  const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0);
  return (
    <Link
      to="/course/$courseId"
      params={{ courseId: course.id }}
      className="group block rounded-xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue-900/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-blue-400/40"
    >
      <div className="mb-3 text-xs font-medium uppercase tracking-wider text-blue-900 dark:text-blue-400">
        {course.category}
      </div>
      <h3 className="font-serif text-xl font-semibold leading-snug text-slate-900 group-hover:text-blue-900 dark:text-slate-100 dark:group-hover:text-blue-400">
        {course.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {course.description}
      </p>
      <div className="mt-4 text-xs text-slate-500 dark:text-slate-500">
        {course.modules.length} módulo{course.modules.length !== 1 && "s"} · {lessonCount} lições
      </div>
    </Link>
  );
}
