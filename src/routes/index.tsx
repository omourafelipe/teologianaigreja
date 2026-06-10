import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useLmsStore } from "@/hooks/useLmsStore";
import { useTheme } from "@/hooks/useTheme";
import {
  BookOpen,
  ArrowRight,
  GraduationCap,
  FolderKanban,
  FileText,
  Tags,
  Moon,
  Sun,
  LogIn,
  UserPlus,
  Compass,
  CheckCircle,
  HelpCircle,
  BookmarkCheck,
  ChevronRight
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: PublicHomePage,
});

function PublicHomePage() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const { currentUser, courses, categories, lessons, modules } = useLmsStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const totalCourses = courses.length;
  const totalCategories = categories.length;
  const totalLessons = lessons.length;

  const handleCtaClick = () => {
    if (currentUser) {
      if (currentUser.role === "teacher") {
        navigate({ to: "/admin/dashboard" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } else {
      navigate({ to: "/register" });
    }
  };

  const handleCourseClick = (courseId: string) => {
    navigate({ to: "/course/$courseId", params: { courseId } });
  };

  const filteredCourses = selectedCategoryId === "all"
    ? courses
    : courses.filter(c => c.category_id === selectedCategoryId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-200">
      
      {/* Navbar Pública */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-serif text-lg font-bold tracking-tight text-blue-900 dark:text-blue-400"
          >
            <BookOpen className="h-5 w-5" />
            <span>Teologia na Igreja</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#courses" className="hover:text-blue-900 dark:hover:text-blue-400 transition">Cursos</a>
            <a href="#features" className="hover:text-blue-900 dark:hover:text-blue-400 transition">Diferenciais</a>
            <a href="#about" className="hover:text-blue-900 dark:hover:text-blue-400 transition">Sobre</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggle}
              aria-label="Alternar tema"
              className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Auth Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs font-medium text-slate-500">
                  Olá, <span className="font-bold text-slate-700 dark:text-slate-300">{currentUser.name}</span>
                </span>
                <Link
                  to={currentUser.role === "teacher" ? "/admin/dashboard" : "/dashboard"}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-400 transition"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Meu Painel</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 transition"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Entrar</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-400 transition"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Cadastrar</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-20 text-white dark:bg-slate-950 sm:py-28">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(30,58,138,0.3),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(180,83,9,0.1),transparent_60%)]"></div>

        <div className="relative mx-auto max-w-4xl px-6 text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-950/80 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 border border-blue-900/60">
            <Compass className="h-3 w-3" /> Escola Bíblica Digital
          </span>

          <h1 className="font-serif text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight text-slate-100">
            Formação Teológica <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Profunda</span> para a Igreja
          </h1>
          
          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-350 leading-relaxed">
            Uma plataforma acadêmica e devocional desenvolvida para o amadurecimento e discipulado bíblico. Estude a teologia bíblica e sistemática com leitura imersiva focada, esboços detalhados para professores e exercícios comentados.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              onClick={handleCtaClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:from-amber-450 hover:to-amber-550 transition transform hover:-translate-y-0.5"
            >
              <span>{currentUser ? "Acessar Plataforma" : "Começar a Estudar Grátis"}</span>
              <ArrowRight className="h-4 w-4 text-slate-950" />
            </button>
            <a
              href="#courses"
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50 px-5 py-2.5 text-xs font-bold text-slate-200 backdrop-blur hover:bg-slate-800 transition"
            >
              Conhecer Grade Curricular
            </a>
          </div>
        </div>
      </section>

      {/* Metrics Strips */}
      <section className="border-y border-slate-200/80 bg-white py-6 dark:border-slate-850 dark:bg-slate-900/30">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-3 divide-x divide-slate-100 text-center dark:divide-slate-800">
            <div>
              <span className="block font-serif text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl">{totalCourses}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5 block">Cursos Ativos</span>
            </div>
            <div>
              <span className="block font-serif text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl">{totalLessons}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5 block">Lições Didáticas</span>
            </div>
            <div>
              <span className="block font-serif text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl">{totalCategories}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5 block">Categorias</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Course Vitrine Section */}
      <section id="courses" className="mx-auto max-w-5xl px-6 py-16 sm:py-24 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50 sm:text-3xl">
            Nossos Cursos Teológicos
          </h2>
          <p className="mx-auto max-w-md text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
            Navegue pelos programas acadêmicos disponíveis e inicie seus estudos agora mesmo de forma gratuita.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-1.5">
          <button
            onClick={() => setSelectedCategoryId("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-tight transition ${
              selectedCategoryId === "all"
                ? "bg-blue-900 text-white dark:bg-blue-500"
                : "bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-tight transition ${
                selectedCategoryId === cat.id
                  ? "bg-blue-900 text-white dark:bg-blue-500"
                  : "bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Courses Cards Grid */}
        {filteredCourses.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl dark:border-slate-850">
            Nenhum curso encontrado nesta categoria.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((c) => {
              const cat = categories.find(cat => cat.id === c.category_id);
              const courseMods = modules.filter((m) => m.course_id === c.id);
              const modIds = courseMods.map((m) => m.id);
              const courseLessons = lessons.filter((l) => modIds.includes(l.module_id));

              return (
                <div
                  key={c.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/30 transition transform hover:-translate-y-0.5"
                >
                  <div>
                    <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-900 dark:bg-blue-950/40 dark:text-blue-450 uppercase tracking-wide">
                      {cat?.name || "Geral"}
                    </span>
                    <h3 className="mt-3 font-serif text-base font-bold text-slate-850 dark:text-slate-100 leading-snug">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3">
                      {c.description || "Nenhuma descrição informada para este curso."}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800/60 text-[10px] text-slate-400 font-semibold">
                    <span>{courseMods.length} Módulo(s) · {courseLessons.length} Lição(ões)</span>
                    <button
                      onClick={() => handleCourseClick(c.id)}
                      className="inline-flex items-center gap-0.5 text-blue-900 hover:text-blue-800 dark:text-blue-450 dark:hover:text-blue-400 underline font-bold"
                    >
                      Acessar Grade <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Core Features Section */}
      <section id="features" className="bg-slate-100/60 dark:bg-slate-900/10 py-16 sm:py-24 border-y border-slate-200/50 dark:border-slate-850/50">
        <div className="mx-auto max-w-5xl px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50 sm:text-3xl">
              Nossos Diferenciais de Aprendizado
            </h2>
            <p className="mx-auto max-w-md text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
              Estruturada especificamente para a profundidade acadêmica e fixação pedagógica de forma equilibrada.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 dark:border-slate-850 dark:bg-slate-900/40 text-center space-y-3">
              <div className="mx-auto rounded-full bg-blue-50 p-3 text-blue-900 dark:bg-blue-950/40 dark:text-blue-400 w-12 h-12 flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-100">
                Leitor Acadêmico Focado
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                Design minimalista `max-w-prose` otimizado para longas leituras teológicas, com Table of Contents dinâmico e suporte completo a temas light/dark.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 dark:border-slate-850 dark:bg-slate-900/40 text-center space-y-3">
              <div className="mx-auto rounded-full bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 w-12 h-12 flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-100">
                Guias para Professores
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                Todas as lições podem vir acompanhadas de orientações didáticas detalhadas, dinâmicas e roteiros de debates prontos para a aula de EBD ou célula.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 dark:border-slate-850 dark:bg-slate-900/40 text-center space-y-3">
              <div className="mx-auto rounded-full bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 w-12 h-12 flex items-center justify-center">
                <BookmarkCheck className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-100">
                Exercícios de Fixação
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                Questionários interativos ao término de cada leitura com gabaritos detalhados comentando as respostas corretas com fundamentação bíblica.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section id="about" className="mx-auto max-w-4xl px-6 py-16 sm:py-24 text-center space-y-6">
        <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50 sm:text-3xl">
          Pronto para Aprofundar Seus Estudos?
        </h2>
        <p className="mx-auto max-w-xl text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Tenha acesso gratuito e imediato à biblioteca digital de teologia e EBD, e acompanhe o seu progresso didático aula após aula.
        </p>
        <div className="pt-2">
          <button
            onClick={handleCtaClick}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-6 py-3 text-xs font-bold text-white shadow-lg hover:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-450 transition"
          >
            <span>Matricule-se Agora Gratuitamente</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white py-12 dark:border-slate-850 dark:bg-slate-950 text-center text-xs text-slate-500 dark:text-slate-550 space-y-3">
        <div className="flex justify-center items-center gap-1.5 font-serif font-bold text-slate-700 dark:text-slate-350">
          <BookOpen className="h-4 w-4 text-blue-900 dark:text-blue-400" />
          <span>Teologia na Igreja</span>
        </div>
        <p className="text-[10px]">
          © {new Date().getFullYear()} EBD Digital. Todos os direitos reservados.
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-600">
          Formação bíblica clássica com foco em leitura integral e retenção didática.
        </p>
      </footer>
    </div>
  );
}
