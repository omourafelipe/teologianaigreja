import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Award,
  ArrowRight,
  Flame,
  Trophy,
  Calendar,
  Zap,
  Sparkles,
  Clock,
  Compass,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useLmsStore } from "@/hooks/useLmsStore";

export const Route = createFileRoute("/dashboard")({
  component: StudentDashboard,
  head: () => ({
    meta: [
      { title: "Meu Painel — Teologia na Igreja" },
      {
        name: "description",
        content:
          "Acompanhe seu progresso, XP, streak e biblioteca de cursos teológicos no seu painel da Escola Bíblica Digital.",
      },
      { property: "og:title", content: "Meu Painel — Teologia na Igreja" },
      {
        property: "og:description",
        content: "Painel pessoal com cursos, progresso e gamificação.",
      },
      { property: "og:url", content: "https://teologianaigreja.lovable.app/dashboard" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://teologianaigreja.lovable.app/dashboard" }],
  }),
});

function StudentDashboard() {
  const {
    currentUser,
    courses,
    categories,
    getCourseProgressPercent,
    getCourseModules,
    getModuleLessons,
    getLessonProgress,
    getActiveChallenges,
    freezeStreak,
  } = useLmsStore();
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
        (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
      );
    }

    return result;
  }, [publishedCourses, selectedCategoryId, searchQuery]);

  // Encontrar curso em andamento (progresso > 0 e < 100) para o card "Continuar Estudando"
  const inProgressCourse = useMemo(() => {
    const courseStats = publishedCourses.map((c) => ({
      course: c,
      progress: getCourseProgressPercent(currentUser.id, c.id),
    }));

    // Tenta achar um que começou mas não terminou
    const active = courseStats.find((cs) => cs.progress > 0 && cs.progress < 100);
    if (active) return active;

    // Caso contrário, pega o primeiro não iniciado
    const notStarted = courseStats.find((cs) => cs.progress === 0);
    return notStarted || courseStats[0];
  }, [publishedCourses, getCourseProgressPercent, currentUser.id]);

  // Identifica a primeira lição pendente desse curso em andamento
  const nextLessonToStudy = useMemo(() => {
    if (!inProgressCourse) return null;
    const { course } = inProgressCourse;
    const modules = getCourseModules(course.id);
    for (const m of modules) {
      const lessons = getModuleLessons(m.id);
      for (const l of lessons) {
        const prog = getLessonProgress(currentUser.id, l.id);
        if (!prog || !prog.is_completed) {
          return l;
        }
      }
    }
    // Caso tudo concluído, retorna a primeira do curso
    const firstMod = modules[0];
    if (firstMod) {
      const firstLes = getModuleLessons(firstMod.id)[0];
      return firstLes || null;
    }
    return null;
  }, [inProgressCourse, getCourseModules, getModuleLessons, getLessonProgress, currentUser.id]);

  // Nível e progresso de XP
  const xpInfo = useMemo(() => {
    const xp = currentUser.xp || 0;
    const level = currentUser.level || "Iniciante";
    let minXp = 0;
    let maxXp = 100;
    let nextLevel = "Aprendiz";

    if (level === "Aprendiz") {
      minXp = 101;
      maxXp = 300;
      nextLevel = "Discípulo";
    } else if (level === "Discípulo") {
      minXp = 301;
      maxXp = 600;
      nextLevel = "Estudioso";
    } else if (level === "Estudioso") {
      minXp = 601;
      maxXp = 1000;
      nextLevel = "Mestre";
    } else if (level === "Mestre") {
      minXp = 1001;
      maxXp = 1001; // Max
      nextLevel = "Ápice";
    }

    const range = maxXp - minXp || 1;
    const progress = level === "Mestre" ? 100 : Math.round(((xp - minXp) / range) * 100);
    const xpNeeded = level === "Mestre" ? 0 : maxXp - xp;

    return { level, xp, progress, nextLevel, xpNeeded };
  }, [currentUser]);

  // Desafios semanais
  const activeChallenges = useMemo(() => {
    return getActiveChallenges(currentUser.id) || [];
  }, [currentUser.id, getActiveChallenges]);

  // Dias da semana para o streak calendar widget
  const weekDays = useMemo(() => {
    const days = ["D", "S", "T", "Q", "Q", "S", "S"];
    const today = new Date().getDay();
    return days.map((label, idx) => {
      const isToday = idx === today;
      const studied =
        currentUser.streak !== undefined &&
        currentUser.streak > 0 &&
        idx <= today &&
        idx > today - (currentUser.streak % 7);
      return { label, isToday, studied };
    });
  }, [currentUser]);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-8 animate-fade-in">
        {/* BOAS VINDAS & CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/50 pb-6 dark:border-slate-800">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              Graça e Paz, {currentUser.name}!{" "}
              <Sparkles className="h-5 w-5 text-yellow-500 fill-current animate-pulse" />
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Pronto para aprofundar seus conhecimentos das Escrituras Sagradas hoje?
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentUser.role === "teacher" && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-900/10 border border-blue-900/20 text-blue-900 px-3.5 py-2 text-xs font-bold hover:bg-blue-900/15 dark:bg-blue-400/10 dark:border-blue-400/20 dark:text-blue-400 dark:hover:bg-blue-400/20 transition"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Painel do Professor</span>
              </Link>
            )}
          </div>
        </div>

        {/* METRICAS DE GAMIFICAÇÃO: XP, NÍVEL E STREAK */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card de Nível & XP */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-900 dark:bg-blue-950/50 dark:text-blue-400">
                  <Trophy className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Nível Atual
                  </span>
                  <h2 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                    {xpInfo.level}
                  </h2>
                </div>
              </div>
              <span className="rounded-full bg-blue-50/50 px-2 py-0.5 text-[9px] font-bold text-blue-900 dark:bg-blue-950/30 dark:text-blue-400">
                {xpInfo.xp} XP acumulado
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>Progresso para {xpInfo.nextLevel}</span>
                <span>{xpInfo.progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-700 to-indigo-900 dark:from-blue-400 dark:to-indigo-500 transition-all duration-355"
                  style={{ width: `${xpInfo.progress}%` }}
                />
              </div>
              {xpInfo.xpNeeded > 0 && (
                <p className="text-[9px] text-slate-450 dark:text-slate-500 italic">
                  Faltam apenas {xpInfo.xpNeeded} XP para subir de nível!
                </p>
              )}
            </div>
          </div>

          {/* Card de Streak Flame */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-orange-50 p-2 text-orange-655 dark:bg-orange-950/40 dark:text-orange-400">
                  <Flame className="h-4.5 w-4.5 fill-current text-orange-555" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Streak de Estudos
                  </span>
                  <h2 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                    {currentUser.streak || 0} Dias Seguidos
                  </h2>
                </div>
              </div>

              {currentUser.xp !== undefined && currentUser.xp >= 50 && (
                <button
                  onClick={() => freezeStreak(currentUser.id)}
                  className="text-[9px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 px-2 py-1 rounded-md border border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 transition shrink-0"
                  title="Gaste 50 XP para proteger seu streak por 1 dia"
                >
                  Congelar Streak
                </button>
              )}
            </div>

            {/* Streak Calendar Calendar view */}
            <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-xl dark:bg-slate-900/40">
              {weekDays.map((wd, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-semibold text-slate-400">{wd.label}</span>
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      wd.isToday ? "border border-orange-500 text-orange-500 shadow-sm" : ""
                    } ${
                      wd.studied
                        ? "bg-orange-500 text-white fill-current"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-850"
                    }`}
                  >
                    {wd.studied ? "🔥" : wd.label.toLowerCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desafios da Semana */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/40 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-yellow-500 fill-current" /> Desafios da Semana
            </h4>

            <div className="space-y-2.5 max-h-[105px] overflow-y-auto pr-1">
              {activeChallenges.length === 0 ? (
                <p className="text-xs text-slate-450 italic py-2">Nenhum desafio ativo.</p>
              ) : (
                activeChallenges.map((ch) => (
                  <div key={ch.id} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium leading-tight">
                      <span className="text-slate-800 dark:text-slate-200 line-clamp-1">
                        {ch.title}
                      </span>
                      <span className="text-slate-500 text-[10px] shrink-0 font-bold">
                        {ch.current}/{ch.target}
                      </span>
                    </div>
                    <div className="relative h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${ch.is_completed ? "bg-emerald-500" : "bg-blue-800 dark:bg-blue-400"}`}
                        style={{ width: `${Math.round((ch.current / ch.target) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* CONTINUAR ESTUDANDO (FOCO PRINCIPAL - UX DUOLINGO) */}
        {inProgressCourse && nextLessonToStudy && (
          <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 p-6 shadow-md text-white border border-blue-950 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse-subtle">
            <div className="space-y-2">
              <span className="rounded-full bg-blue-800/50 border border-blue-700 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-300">
                Continuar Estudando
              </span>
              <h2 className="font-serif text-lg md:text-xl font-bold tracking-tight">
                {inProgressCourse.course.title}
              </h2>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-400" /> Próxima Lição:{" "}
                <span className="font-semibold text-white">{nextLessonToStudy.title}</span>
              </p>
            </div>

            <Link
              to="/lesson/$lessonId"
              params={{ lessonId: nextLessonToStudy.id }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-400 px-5 py-3 text-xs font-bold text-slate-950 shadow hover:bg-blue-300 transition shrink-0 uppercase tracking-wider"
            >
              Iniciar Leitura <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* BUSCA E BIBLIOTECA DE CURSOS */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-105">
                Biblioteca de Cursos
              </h2>
              <p className="text-xs text-slate-450 mt-0.5">
                Explore as disciplinas disponíveis para formação contínua.
              </p>
            </div>

            <div className="relative w-full max-w-xs shrink-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar estudos..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-450 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400"
              />
            </div>
          </div>

          {/* Filtros de Categorias */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold tracking-tight transition ${
                selectedCategoryId === "all"
                  ? "bg-blue-900 text-white dark:bg-blue-400 dark:text-slate-950"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-450 dark:hover:bg-slate-800"
              }`}
            >
              Todos os Temas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold tracking-tight transition ${
                  selectedCategoryId === cat.id
                    ? "bg-blue-900 text-white dark:bg-blue-400 dark:text-slate-950"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-450 dark:hover:bg-slate-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid de Cursos */}
          {filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <Compass className="h-8 w-8 text-slate-300 dark:text-slate-755" />
              <h3 className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-350">
                Nenhum curso encontrado
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-xs">
                Não encontramos nenhum curso que corresponda à sua busca.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredCourses.map((c) => {
                const progress = getCourseProgressPercent(currentUser.id, c.id);
                const categoryName =
                  categories.find((cat) => cat.id === c.category_id)?.name || "Geral";
                const modules = getCourseModules(c.id);
                const totalLessons = modules.reduce(
                  (acc, m) => acc + getModuleLessons(m.id).length,
                  0,
                );

                return (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-900/40 hover:shadow-md dark:border-slate-850 dark:bg-slate-950/20 dark:hover:border-blue-400/40"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-blue-50 px-2.5 py-0.5 text-[9px] font-bold text-blue-900 dark:bg-blue-950/40 dark:text-blue-400">
                          {categoryName}
                        </span>
                        {c.version && (
                          <span className="text-[8px] font-semibold text-slate-400">
                            {c.version}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {c.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
                        {c.description}
                      </p>
                    </div>

                    <div className="mt-6 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-900">
                      {/* Barra de Progresso */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-bold">
                          <span className="text-slate-400">Conclusão</span>
                          <span className="text-slate-700 dark:text-slate-350">{progress}%</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-900 dark:bg-blue-400 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer Card */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-450 font-medium">
                          {totalLessons} lições em {modules.length} módulos
                        </span>
                        <Link
                          to="/course/$courseId"
                          params={{ courseId: c.id }}
                          className="inline-flex items-center gap-0.5 font-bold text-blue-900 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 uppercase tracking-tight"
                        >
                          {progress > 0 ? "Estudar" : "Ver Grade"}{" "}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
