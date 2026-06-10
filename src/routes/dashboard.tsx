import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Search, BookOpen, GraduationCap, CheckCircle2, Award, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useLmsStore } from "@/hooks/useLmsStore";

export const Route = createFileRoute("/dashboard")({
  component: StudentDashboard,
});

function StudentDashboard() {
  const { currentUser, courses, categories, getCourseProgressPercent, getCourseModules, getModuleLessons } = useLmsStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  // Roteamento de proteção de sessão
  useEffect(() => {
    if (!currentUser && typeof window !== "undefined") {
      navigate({ to: "/login" });
    }
  }, [currentUser]);

  if (!currentUser) return null;

  // Filtrar cursos publicados
  const publishedCourses = useMemo(() => {
    return courses.filter((c) => c.is_published);
  }, [courses]);

  // Cursos filtrados por busca e categoria
  const filteredCourses = useMemo(() => {
    let result = publishedCourses;

    if (selectedCategoryId !== "all") {
      result = result.filter((c) => c.category_id === selectedCategoryId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [publishedCourses, selectedCategoryId, searchQuery]);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8 animate-fade-in">
        {/* Boas-vindas */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/50 pb-6 dark:border-slate-800">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Minha Biblioteca
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Olá, {currentUser.name}! Continue seus estudos bíblicos e teológicos de forma profunda.
            </p>
          </div>
        </div>

        {/* Busca e Filtros de Categoria */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar estudos e cursos..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-800 placeholder:text-slate-455 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400"
            />
          </div>

          {/* Filtros de Categorias (Estilo Filosofia na Escola) */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold tracking-tight transition ${
                selectedCategoryId === "all"
                  ? "bg-blue-900 text-white dark:bg-blue-400 dark:text-slate-950"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold tracking-tight transition ${
                  selectedCategoryId === cat.id
                    ? "bg-blue-900 text-white dark:bg-blue-400 dark:text-slate-950"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Listagem dos Cursos */}
        {filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-700" />
            <h3 className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-350">Nenhum curso encontrado</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-xs">Não encontramos nenhum curso publicado que corresponda aos filtros de busca atuais.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredCourses.map((c) => {
              const progress = getCourseProgressPercent(currentUser.id, c.id);
              const categoryName = categories.find((cat) => cat.id === c.category_id)?.name || "Geral";
              
              // Total de lições
              const modules = getCourseModules(c.id);
              const totalLessons = modules.reduce((acc, m) => acc + getModuleLessons(m.id).length, 0);

              return (
                <div
                  key={c.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-900/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-blue-400/40"
                >
                  <div className="space-y-3">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-900 dark:bg-blue-950/40 dark:text-blue-400">
                      {categoryName}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {c.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
                      {c.description}
                    </p>
                  </div>

                  <div className="mt-6 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-850">
                    {/* Barra de Progresso */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-semibold">
                        <span className="text-slate-400 dark:text-slate-500">Progresso</span>
                        <span className="text-slate-600 dark:text-slate-350">{progress}% concluído</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-900 dark:bg-blue-400 transition-all duration-355"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer Card */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {totalLessons} lições divididas em {modules.length} módulos
                      </span>
                      <Link
                        to="/course/$courseId"
                        params={{ courseId: c.id }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-900 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {progress > 0 ? "Continuar" : "Iniciar"} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
