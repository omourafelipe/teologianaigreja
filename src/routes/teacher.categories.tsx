import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Edit, Check, X, Tag } from "lucide-react";
import { useCourseStore } from "@/hooks/useCourseStore";

export const Route = createFileRoute("/teacher/categories")({
  component: TeacherCategories,
});

function TeacherCategories() {
  const { categories, addCategory, updateCategory, deleteCategory, courses } = useCourseStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCategory({
      name: name.trim(),
      description: description.trim(),
    });

    setName("");
    setDescription("");
  };

  const handleStartEdit = (id: string, currentName: string, currentDesc?: string) => {
    setEditingId(id);
    setEditName(currentName);
    setEditDescription(currentDesc || "");
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    updateCategory(id, {
      name: editName.trim(),
      description: editDescription.trim(),
    });
    setEditingId(null);
  };

  const handleDelete = (id: string, catName: string) => {
    const isUsed = courses.some((c) => c.category === catName);
    if (isUsed) {
      alert(`A categoria "${catName}" não pode ser excluída porque existem cursos cadastrados nela.`);
      return;
    }

    if (confirm(`Deseja realmente excluir a categoria "${catName}"?`)) {
      deleteCategory(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Gerenciar Categorias
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Crie e edite tópicos temáticos para organizar a sua biblioteca.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add Category Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40 lg:col-span-1">
          <h3 className="font-serif text-base font-semibold text-slate-900 dark:text-slate-100">
            Nova Categoria
          </h3>
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="cat-name"
                className="text-[11px] font-semibold text-slate-500 uppercase dark:text-slate-450"
              >
                Nome *
              </label>
              <input
                id="cat-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Teologia Prática"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="cat-desc"
                className="text-[11px] font-semibold text-slate-500 uppercase dark:text-slate-450"
              >
                Descrição
              </label>
              <textarea
                id="cat-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Livros de aconselhamento, liderança e vida cristã..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-900 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition"
            >
              <Plus className="h-4 w-4" /> Criar Categoria
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40 lg:col-span-2">
          <h3 className="mb-4 font-serif text-base font-semibold text-slate-900 dark:text-slate-100">
            Categorias Ativas ({categories.length})
          </h3>

          {categories.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-slate-400">
              Nenhuma categoria criada.
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((cat) => {
                const isEditing = editingId === cat.id;
                const coursesCount = courses.filter((c) => c.category === cat.name).length;

                return (
                  <div
                    key={cat.id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-100 p-4 dark:border-slate-850 dark:bg-slate-950/20"
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-semibold text-slate-400">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-semibold text-slate-400">
                            Descrição
                          </label>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-900"
                            title="Cancelar"
                          >
                            <X className="h-4.5 w-4.5 text-slate-450 hover:text-slate-650" />
                          </button>
                          <button
                            onClick={() => handleSaveEdit(cat.id)}
                            className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-900"
                            title="Salvar"
                          >
                            <Check className="h-4.5 w-4.5 text-emerald-600 hover:text-emerald-700" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5 text-slate-450" />
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {cat.name}
                            </h4>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              {coursesCount} curso(s)
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {cat.description || "Nenhuma descrição informada."}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(cat.id, cat.name, cat.description)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition"
                            title="Editar Categoria"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-650 transition dark:hover:bg-red-950/20"
                            title="Excluir Categoria"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
