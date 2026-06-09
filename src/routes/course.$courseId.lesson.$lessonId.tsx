import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, List } from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { SidebarDrawer } from "@/components/SidebarDrawer";
import { findLesson } from "@/data/mockData";

export const Route = createFileRoute("/course/$courseId/lesson/$lessonId")({
  loader: ({ params }) => {
    const data = findLesson(params.courseId, params.lessonId);
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.entry.lesson.title} — ${loaderData.course.title}` },
          { name: "description", content: `${loaderData.entry.moduleTitle} · ${loaderData.course.title}` },
        ]
      : [],
  }),
  component: LessonPage,
  notFoundComponent: () => (
    <Layout>
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-serif text-2xl">Lição não encontrada</h1>
        <Link to="/" className="mt-4 inline-block text-sm text-blue-900 dark:text-blue-400">
          ← Voltar à biblioteca
        </Link>
      </div>
    </Layout>
  ),
  errorComponent: () => (
    <Layout>
      <div className="mx-auto max-w-3xl px-6 py-20 text-center text-sm text-slate-500">
        Não foi possível carregar esta lição.
      </div>
    </Layout>
  ),
});

function LessonPage() {
  const { course, entry, prev, next } = Route.useLoaderData();
  const [open, setOpen] = useState(false);

  return (
    <Layout>
      <SidebarDrawer
        course={course}
        currentLessonId={entry.lesson.id}
        open={open}
        onClose={() => setOpen(false)}
      />

      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-20 z-30 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-900/40 hover:text-blue-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-blue-400"
      >
        <List className="h-3.5 w-3.5" /> Índice
      </button>

      <article className="mx-auto max-w-prose px-6 py-12">
        <Link
          to="/course/$courseId"
          params={{ courseId: course.id }}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-blue-900 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {course.title}
        </Link>
        <div className="mt-6 text-xs uppercase tracking-wider text-slate-500">
          {entry.moduleTitle}
        </div>

        <div className="mt-2">
          <MarkdownRenderer content={entry.lesson.content} />
        </div>

        <nav className="mt-16 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
          {prev ? (
            <Link
              to="/course/$courseId/lesson/$lessonId"
              params={{ courseId: course.id, lessonId: prev.lesson.id }}
              className="group flex-1 rounded-lg border border-slate-200 p-4 text-left transition hover:border-blue-900/40 dark:border-slate-800 dark:hover:border-blue-400/40"
            >
              <div className="text-xs text-slate-500">← Anterior</div>
              <div className="mt-1 text-sm font-medium text-slate-800 group-hover:text-blue-900 dark:text-slate-200 dark:group-hover:text-blue-400">
                {prev.lesson.title}
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {next ? (
            <Link
              to="/course/$courseId/lesson/$lessonId"
              params={{ courseId: course.id, lessonId: next.lesson.id }}
              className="group flex-1 rounded-lg border border-slate-200 p-4 text-right transition hover:border-blue-900/40 dark:border-slate-800 dark:hover:border-blue-400/40"
            >
              <div className="text-xs text-slate-500">Próxima →</div>
              <div className="mt-1 text-sm font-medium text-slate-800 group-hover:text-blue-900 dark:text-slate-200 dark:group-hover:text-blue-400">
                {next.lesson.title}
              </div>
            </Link>
          ) : (
            <div className="flex-1 text-right text-xs text-slate-500">
              <ArrowRight className="ml-auto h-4 w-4 opacity-30" />
              Fim do curso
            </div>
          )}
        </nav>
      </article>
    </Layout>
  );
}
