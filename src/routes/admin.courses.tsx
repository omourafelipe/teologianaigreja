import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useLmsStore } from "@/hooks/useLmsStore";
import { FolderKanban, Plus, Trash2, Edit, BookOpen, Check, X, Tag, Tags } from "lucide-react";

export const Route = createFileRoute("/admin/courses")({
  component: AdminCoursesPage,
});

function AdminCoursesPage() {
  const {
    courses,
    categories,
    modules,
    lessons,
    addCourse,
    updateCourse,
    deleteCourse,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useLmsStore();

  const [activeTab, setActiveTab] = useState<"courses" | "categories">("courses");

  // State for Course CRUD
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseCategoryId, setCourseCategoryId] = useState("");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseTitle, setEditCourseTitle] = useState("");
  const [editCourseDesc, setEditCourseDesc] = useState("");
  const [editCourseCategoryId, setEditCourseCategoryId] = useState("");

  // State for Category CRUD
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");

  // Course handlers
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseCategoryId) {
      alert("Por favor, preencha o título e selecione uma categoria.");
      return;
    }
    addCourse(courseTitle.trim(), courseDesc.trim(), courseCategoryId);
    setCourseTitle("");
    setCourseDesc("");
    setCourseCategoryId("");
  };

  const handleStartEditCourse = (id: string, title: string, desc: string, catId: string) => {
    setEditingCourseId(id);
    setEditCourseTitle(title);
    setEditCourseDesc(desc);
    setEditCourseCategoryId(catId);
  };

  const handleSaveEditCourse = (id: string) => {
    if (!editCourseTitle.trim() || !editCourseCategoryId) {
      alert("Título e Categoria são obrigatórios.");
      return;
    }
    updateCourse(id, {
      title: editCourseTitle.trim(),
      description: editCourseDesc.trim(),
      category_id: editCourseCategoryId,
    });
    setEditingCourseId(null);
  };

  const handleDeleteCourse = (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir o curso "${title}"? Todos os módulos, lições e quizzes associados serão excluídos permanentemente.`)) {
      deleteCourse(id);
    }
  };

  // Category handlers
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    addCategory(catName.trim(), catDesc.trim());
    setCatName("");
    setCatDesc("");
  };

  const handleStartEditCategory = (id: string, name: string, desc?: string) => {
    setEditingCatId(id);
    setEditCatName(name);
    setEditCatDesc(desc || "");
  };

  const handleSaveEditCategory = (id: string) => {
    if (!editCatName.trim()) return;
    updateCategory(id, {
      name: editCatName.trim(),
      description: editCatDesc.trim(),
    });
    setEditingCatId(null);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    const isUsed = courses.some((c) => c.category_id === id);
    if (isUsed) {
      alert(`A categoria "${name}" não pode ser excluída porque existem cursos associados a ela.`);
      return;
    }
    if (confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) {
      deleteCategory(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">
          Gerenciamento de Conteúdo
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Crie cursos, estruture lições e organize sua biblioteca com categorias.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/60 dark:border-slate-800/60">
        <button
          onClick={() => setActiveTab("courses")}
          className={`border-b-2 px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "courses"
              ? "border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Cursos ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`border-b-2 px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "categories"
              ? "border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Categorias ({categories.length})
        </button>
      </div>

      {/* Courses Tab Content */}
      {activeTab === "courses" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Create Course Form */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40 lg:col-span-1 h-fit">
            <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">
              Criar Novo Curso
            </h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">
                  Título do Curso *
                </label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Ex: Teologia Sistemática I"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">
                  Categoria *
                </label>
                <select
                  value={courseCategoryId}
                  onChange={(e) => setCourseCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400"
                  required
                >
                  <option value="">Selecione uma Categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">
                  Descrição
                </label>
                <textarea
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Ex: Uma introdução acadêmica e devocional sobre a doutrina da revelação..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-805 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-900 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition"
              >
                <Plus className="h-4 w-4" /> Criar Curso
              </button>
            </form>
          </div>

          {/* Courses List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-100">
              Cursos Ativos ({courses.length})
            </h3>

            {courses.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-800">
                Nenhum curso cadastrado ainda.
              </div>
            ) : (
              <div className="grid gap-4">
                {courses.map((c) => {
                  const categoryName = categories.find((cat) => cat.id === c.category_id)?.name || "Sem Categoria";
                  const isEditing = editingCourseId === c.id;
                  const courseMods = modules.filter((m) => m.course_id === c.id);
                  const modIds = courseMods.map((m) => m.id);
                  const courseLessons = lessons.filter((l) => modIds.includes(l.module_id));

                  if (isEditing) {
                    return (
                      <div
                        key={c.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900/40 space-y-4"
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Título</label>
                            <input
                              type="text"
                              value={editCourseTitle}
                              onChange={(e) => setEditCourseTitle(e.target.value)}
                              className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-250"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Categoria</label>
                            <select
                              value={editCourseCategoryId}
                              onChange={(e) => setEditCourseCategoryId(e.target.value)}
                              className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-250"
                            >
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Descrição</label>
                          <textarea
                            value={editCourseDesc}
                            onChange={(e) => setEditCourseDesc(e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingCourseId(null)}
                            className="rounded px-3 py-1.5 border border-slate-200 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-900"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveEditCourse(c.id)}
                            className="rounded bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={c.id}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-900 dark:bg-blue-950/40 dark:text-blue-400">
                            <Tag className="h-3 w-3" /> {categoryName}
                          </span>
                          <span className="text-[9px] text-slate-450">
                            {courseMods.length} Módulo(s) · {courseLessons.length} Lição(ões)
                          </span>
                        </div>
                        <h4 className="mt-2.5 font-serif text-base font-bold text-slate-850 dark:text-slate-100">
                          {c.title}
                        </h4>
                        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {c.description || "Nenhuma descrição informada."}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/60">
                        <Link
                          to="/admin/course/$courseId/builder"
                          params={{ courseId: c.id }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-900 hover:underline dark:text-blue-400"
                        >
                          <BookOpen className="h-4 w-4" /> Gerenciar Aulas
                        </Link>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEditCourse(c.id, c.title, c.description, c.category_id)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                            title="Editar Metadados"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(c.id, c.title)}
                            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-650 dark:hover:bg-red-950/20"
                            title="Excluir Curso"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories Tab Content */}
      {activeTab === "categories" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Create Category Form */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40 lg:col-span-1 h-fit">
            <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">
              Criar Nova Categoria
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ex: Teologia Bíblica"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">
                  Descrição
                </label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Ex: Assuntos voltados para exegese, panoramas e exegese do Antigo e Novo Testamento..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-805 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-900 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition"
              >
                <Plus className="h-4 w-4" /> Criar Categoria
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-100">
              Categorias Ativas ({categories.length})
            </h3>

            {categories.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-800">
                Nenhuma categoria cadastrada ainda.
              </div>
            ) : (
              <div className="grid gap-3">
                {categories.map((cat) => {
                  const isEditing = editingCatId === cat.id;
                  const coursesCount = courses.filter((c) => c.category_id === cat.id).length;

                  if (isEditing) {
                    return (
                      <div
                        key={cat.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900/40 space-y-3 animate-fade-in"
                      >
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Nome</label>
                          <input
                            type="text"
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-250"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Descrição</label>
                          <textarea
                            value={editCatDesc}
                            onChange={(e) => setEditCatDesc(e.target.value)}
                            rows={2}
                            className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingCatId(null)}
                            className="rounded px-2.5 py-1.5 border border-slate-200 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800 dark:text-slate-355 dark:hover:bg-slate-900"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveEditCategory(cat.id)}
                            className="rounded bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={cat.id}
                      className="flex items-start justify-between rounded-lg border border-slate-200/80 bg-white p-3 dark:border-slate-850 dark:bg-slate-900/20"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Tags className="h-3.5 w-3.5 text-slate-450" />
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {cat.name}
                          </h4>
                          <span className="rounded bg-slate-150 px-1.5 py-0.5 text-[8px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {coursesCount} curso(s)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {cat.description || "Sem descrição informada."}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEditCategory(cat.id, cat.name, cat.description)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition"
                          title="Editar Categoria"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-650 transition dark:hover:bg-red-950/20"
                          title="Excluir Categoria"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
