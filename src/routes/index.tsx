import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { CourseCard } from "@/components/CourseCard";
import { courses } from "@/data/mockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EBD Digital — Biblioteca de Cursos" },
      { name: "description", content: "Cursos de teologia e estudo bíblico para leitura calma e profunda." },
      { property: "og:title", content: "EBD Digital — Biblioteca de Cursos" },
      { property: "og:description", content: "Cursos de teologia e estudo bíblico para leitura calma e profunda." },
    ],
  }),
  component: Home,
});

function Home() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(t) ||
        c.description.toLowerCase().includes(t) ||
        c.category.toLowerCase().includes(t),
    );
  }, [q]);

  return (
    <Layout>
      <section className="mx-auto max-w-5xl px-6 pt-12 pb-8">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
          Biblioteca
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
          Estudos teológicos e bíblicos desenhados para leitura sem pressa — como um bom livro.
        </p>
        <div className="relative mt-8 max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar cursos…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400 dark:focus:ring-blue-400/10"
          />
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-16">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum curso encontrado.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {filtered.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
