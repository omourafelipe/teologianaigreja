import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { useCourseStore } from "@/hooks/useCourseStore";

export const Route = createFileRoute("/teacher/courses/new")({
  component: NewCoursePage,
});

function NewCoursePage() {
  const { categories, addCourse } = useCourseStore();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("O título do curso é obrigatório.");
      return;
    }
    if (!category) {
      setError("Selecione uma categoria para o curso.");
      return;
    }

    const newCourse = addCourse({
      title: title.trim(),
      description: description.trim(),
      category,
    });

    // After creating, redirect directly to the newly created course structure editor
    navigate({
      to: "/teacher/courses/$courseId",
      params: { courseId: newCourse.id },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          to="/teacher/courses"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Novo Curso
          </h1>
          <p className="text-xs text-slate-500">
            Crie a estrutura inicial do seu curso.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 dark:bg-red-950/20 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="title"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Título do Curso *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Introdução à Teologia Sistemática"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400 dark:focus:ring-blue-400/10"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="category"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Categoria *
            </label>
            <div className="flex gap-2">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400 dark:focus:ring-blue-400/10"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Link
                to="/teacher/categories"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Nova Categoria
              </Link>
            </div>
            {categories.length === 0 && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                Nenhuma categoria criada ainda. Crie uma categoria primeiro antes de cadastrar o curso.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Descrição
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva brevemente o conteúdo, objetivos e para quem é destinado este curso..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400 dark:focus:ring-blue-400/10"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <Link
              to="/teacher/courses"
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300"
            >
              <Check className="h-4 w-4" /> Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
