import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ChevronDown, CheckCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useLmsStore } from "@/hooks/useLmsStore";

export const Route = createFileRoute("/course/$courseId")({
  component: CoursePage,
  head: ({ params }) => {
    const url = `https://teologianaigreja.lovable.app/course/${params.courseId}`;
    const title = "Curso de Teologia — Teologia na Igreja";
    const description =
      "Grade de módulos e lições deste curso teológico da Escola Bíblica Digital Teologia na Igreja.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: title,
            description,
            url,
            provider: {
              "@type": "EducationalOrganization",
              name: "Teologia na Igreja",
              url: "https://teologianaigreja.lovable.app",
            },
          }),
        },
      ],
    };
  },
});

function CoursePage() {
  const { courseId } = Route.useParams();
  const {
    currentUser,
    getFullCourse,
    getCourseFlatLessons,
    getLessonProgress,
    getCourseProgressPercent,
    categories,
  } = useLmsStore();
  const navigate = useNavigate();

  // Roteamento de proteção de sessão
  useEffect(() => {
    if (!currentUser && typeof window !== "undefined") {
      navigate({ to: "/login" });
    }
  }, [currentUser]);

  const course = useMemo(() => getFullCourse(courseId), [courseId, getFullCourse]);

  // Acordeão de Módulos (todos abertos por padrão)
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (course) {
      setOpenModules(Object.fromEntries(course.modules.map((m) => [m.id, true])));
    }
  }, [course]);

  if (!currentUser || !course) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="font-serif text-2xl">Curso não encontrado</h1>
          <Link
            to="/dashboard"
            className="mt-4 inline-block text-sm text-blue-900 dark:text-blue-400"
          >
            ← Voltar à biblioteca
          </Link>
        </div>
      </Layout>
    );
  }

  const flatLessons = getCourseFlatLessons(course.id);
  const progressPercent = getCourseProgressPercent(currentUser.id, course.id);

  // Encontrar a primeira lição não concluída
  const firstUncompletedLesson = useMemo(() => {
    return flatLessons.find((f) => {
      const prog = getLessonProgress(currentUser.id, f.lesson.id);
      return !prog || !prog.is_completed;
    });
  }, [flatLessons, getLessonProgress, currentUser.id]);

  const resumeLessonId = firstUncompletedLesson?.lesson.id || flatLessons[0]?.lesson.id;

  const categoryName = categories.find((cat) => cat.id === course.category_id)?.name || "Geral";

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  return (
    <Layout>
      <article className="mx-auto max-w-3xl px-6 py-12 space-y-8 animate-fade-in">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-blue-900 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar à Biblioteca
        </Link>

        <div>
          <span className="rounded bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-900 dark:bg-blue-950/40 dark:text-blue-400">
            {categoryName}
          </span>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-555">
            {course.title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {course.description}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-b border-slate-200/50 py-5 dark:border-slate-800">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <div className="flex justify-between text-[10px] font-semibold">
                <span className="text-slate-400">Seu Progresso</span>
                <span className="text-slate-600 dark:text-slate-350">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-900 dark:bg-blue-400 transition-all duration-355"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {resumeLessonId && (
              <Link
                to="/lesson/$lessonId"
                params={{ lessonId: resumeLessonId }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition shrink-0"
              >
                <BookOpen className="h-4 w-4" />
                {progressPercent > 0 ? "Continuar Leitura" : "Iniciar Leitura"}
              </Link>
            )}
          </div>
        </div>

        {/* Ementa de Módulos (Syllabus Accordion) */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
            Grade de Módulos e Lições
          </h2>

          <div className="divide-y divide-slate-200/60 rounded-xl border border-slate-200 bg-white dark:divide-slate-800/80 dark:border-slate-800 dark:bg-slate-950/40 shadow-sm">
            {course.modules.map((mod) => {
              const isOpen = !!openModules[mod.id];
              return (
                <div key={mod.id} className="overflow-hidden">
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/10 dark:hover:bg-slate-900/30 transition"
                  >
                    <span className="font-serif text-sm font-bold text-slate-900 dark:text-slate-100">
                      {mod.title}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-250 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-850">
                      {mod.lessons.length === 0 ? (
                        <li className="px-5 py-3 text-xs text-slate-400 italic">
                          Nenhuma lição adicionada neste módulo.
                        </li>
                      ) : (
                        mod.lessons.map((les, index) => {
                          const prog = getLessonProgress(currentUser.id, les.id);
                          const isCompleted = prog?.is_completed;

                          return (
                            <li key={les.id}>
                              <Link
                                to="/lesson/$lessonId"
                                params={{ lessonId: les.id }}
                                className="flex items-center justify-between gap-4 px-5 py-3 text-xs text-slate-650 transition hover:bg-slate-50/50 hover:text-blue-900 dark:text-slate-350 dark:hover:bg-slate-900/50 dark:hover:text-blue-400"
                              >
                                <div className="flex items-baseline gap-3">
                                  <span className="w-5 text-[10px] tabular-nums font-bold text-slate-400">
                                    {index + 1}.
                                  </span>
                                  <span className="font-medium">{les.title}</span>
                                </div>
                                {isCompleted && (
                                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                )}
                              </Link>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </article>
    </Layout>
  );
}
