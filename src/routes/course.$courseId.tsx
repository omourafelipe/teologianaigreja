import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Layout } from "@/components/Layout";
import { CourseAccordion } from "@/components/CourseAccordion";
import { useCourseStore } from "@/hooks/useCourseStore";

export const Route = createFileRoute("/course/$courseId")({
  head: ({ params }) => {
    // Return metadata
    return {
      meta: [
        { title: `Curso — EBD Digital` },
      ],
    };
  },
  component: CoursePage,
});

function CoursePage() {
  const { courseId } = Route.useParams();
  const { getCourse, getFlatLessons } = useCourseStore();
  const course = getCourse(courseId);

  if (!course) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="font-serif text-2xl">Curso não encontrado</h1>
          <Link to="/" className="mt-4 inline-block text-sm text-blue-900 dark:text-blue-400">
            ← Voltar à biblioteca
          </Link>
        </div>
      </Layout>
    );
  }

  const flat = getFlatLessons(course);
  const first = flat[0];
  return (
    <Layout>
      <article className="mx-auto max-w-3xl px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-blue-900 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Biblioteca
        </Link>
        <div className="mt-6 text-xs font-medium uppercase tracking-wider text-blue-900 dark:text-blue-400">
          {course.category}
        </div>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {course.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
          {course.description}
        </p>
        {first && (
          <Link
            to="/course/$courseId/lesson/$lessonId"
            params={{ courseId: course.id, lessonId: first.lesson.id }}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300"
          >
            <BookOpen className="h-4 w-4" /> Começar a ler
          </Link>
        )}
        <div className="mt-10">
          <h2 className="mb-4 font-serif text-lg font-semibold text-slate-900 dark:text-slate-100">
            Sumário
          </h2>
          <CourseAccordion course={course} />
        </div>
      </article>
    </Layout>
  );
}

