import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, List, ChevronDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { MarkdownRenderer, slugify } from "@/components/MarkdownRenderer";
import { SidebarDrawer } from "@/components/SidebarDrawer";
import { useCourseStore } from "@/hooks/useCourseStore";

export const Route = createFileRoute("/course/$courseId/lesson/$lessonId")({
  head: () => ({
    meta: [
      { title: "Leitura — EBD Digital" }
    ],
  }),
  component: LessonPage,
});

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(markdown: string): HeadingItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: HeadingItem[] = [];
  let match;

  const cleanMarkdownText = (text: string) => {
    return text
      .replace(/\*\*|__/g, "") // Bold
      .replace(/\*|_/g, "") // Italic
      .replace(/`([^`]+)`/g, "$1") // Code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // Links
  };

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const rawText = match[2].trim();
    const text = cleanMarkdownText(rawText);
    const id = slugify(text);
    headings.push({ id, text, level });
  }
  return headings;
}

function LessonPage() {
  const { courseId, lessonId } = Route.useParams();
  const { findLesson } = useCourseStore();
  
  const data = findLesson(courseId, lessonId);

  if (!data) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="font-serif text-2xl">Lição não encontrada</h1>
          <Link to="/" className="mt-4 inline-block text-sm text-blue-900 dark:text-blue-400">
            ← Voltar à biblioteca
          </Link>
        </div>
      </Layout>
    );
  }

  const { course, entry, prev, next } = data;
  const [open, setOpen] = useState(false);
  const [tocExpanded, setTocExpanded] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");

  // Extract headings from lesson content
  const headings = useMemo(() => {
    return extractHeadings(entry.lesson.content);
  }, [entry.lesson.content]);

  // Track active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      // Offset of 120px to account for sticky header and page spacing
      const scrollPosition = window.scrollY + 120;
      let currentActive = "";

      for (let i = 0; i < headings.length; i++) {
        const el = document.getElementById(headings[i].id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            currentActive = headings[i].id;
          } else {
            break;
          }
        }
      }

      if (!currentActive && headings.length > 0) {
        currentActive = headings[0].id;
      }

      setActiveHeadingId(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings]);

  const handleHeadingClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveHeadingId(id);
      window.history.pushState(null, "", `#${id}`);
    }
  };

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

      <div className="mx-auto max-w-5xl px-6 py-12 lg:grid lg:grid-cols-[1fr_240px] lg:gap-12">
        <article className="min-w-0 max-w-prose mx-auto lg:mx-0 w-full">
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

          {/* Mobile Table of Contents Accordion */}
          {headings.length > 0 && (
            <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-900/30 lg:hidden">
              <button
                onClick={() => setTocExpanded(!tocExpanded)}
                className="flex w-full items-center justify-between font-serif text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                <span>Nesta lição ({headings.length} tópicos)</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                    tocExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {tocExpanded && (
                <div className="mt-3 border-t border-slate-200/60 pt-3 dark:border-slate-800/60">
                  <div className="relative border-l border-slate-200 dark:border-slate-800 py-1 space-y-2.5">
                    {headings.map((h) => {
                      const isActive = activeHeadingId === h.id;
                      return (
                        <a
                          key={h.id}
                          href={`#${h.id}`}
                          onClick={(e) => {
                            handleHeadingClick(e, h.id);
                            setTocExpanded(false);
                          }}
                          className={`block text-xs transition-all duration-200 hover:text-blue-900 dark:hover:text-blue-400 ${
                            h.level === 3 ? "pl-8" : "pl-4"
                          } ${
                            isActive
                              ? "font-medium text-blue-900 dark:text-blue-400 border-l-2 border-blue-900 dark:border-blue-400 -ml-[1px]"
                              : "text-slate-500 border-l border-transparent"
                          }`}
                        >
                          {h.text}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

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

        {/* Desktop Table of Contents Sidebar */}
        {headings.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <h2 className="mb-4 font-serif text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Nesta lição
              </h2>
              <div className="relative border-l border-slate-200 dark:border-slate-800 py-1 space-y-2.5">
                {headings.map((h) => {
                  const isActive = activeHeadingId === h.id;
                  return (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      onClick={(e) => handleHeadingClick(e, h.id)}
                      className={`block text-xs transition-all duration-200 hover:text-blue-900 dark:hover:text-blue-400 ${
                        h.level === 3 ? "pl-8" : "pl-4"
                      } ${
                        isActive
                          ? "font-medium text-blue-900 dark:text-blue-400 border-l-2 border-blue-900 dark:border-blue-400 -ml-[1px]"
                          : "text-slate-500 border-l border-transparent"
                      }`}
                    >
                      {h.text}
                    </a>
                  );
                })}
              </div>
            </div>
          </aside>
        )}
      </div>
    </Layout>
  );
}
