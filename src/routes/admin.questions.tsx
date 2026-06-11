import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { HelpCircle, Search, Plus, Filter, BookOpen, AlertCircle, Trash2 } from "lucide-react";
import { useLmsStore } from "@/hooks/useLmsStore";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/questions")({
  component: AdminQuestionsPage,
});

function AdminQuestionsPage() {
  const { quizzes, lessons, addQuiz, deleteQuiz } = useLmsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [selectedLessonId, setSelectedLessonId] = useState("all");

  // Form state to create a quiz
  const [isAdding, setIsAdding] = useState(false);
  const [newLessonId, setNewLessonId] = useState("");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptionsText, setNewOptionsText] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanationText, setExplanationText] = useState("");

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchSearch =
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.explanation && q.explanation.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDiff = difficultyFilter === "all" || q.difficulty === difficultyFilter;
      const matchLesson = selectedLessonId === "all" || q.lesson_id === selectedLessonId;
      return matchSearch && matchDiff && matchLesson;
    });
  }, [quizzes, searchQuery, difficultyFilter, selectedLessonId]);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonId || !newQuestionText.trim()) return;

    addQuiz(
      newLessonId,
      newQuestionText,
      newOptionsText.filter((o) => o.trim() !== ""),
      correctIndex,
      explanationText,
    );

    // Reset state
    setNewQuestionText("");
    setNewOptionsText(["", "", "", ""]);
    setCorrectIndex(0);
    setExplanationText("");
    setIsAdding(false);
  };

  const handleOptionChange = (idx: number, val: string) => {
    setNewOptionsText((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-900 dark:text-blue-400" /> Banco de Questões
          </h1>
          <p className="text-xs text-slate-500">
            Gerencie e crie testes de fixação para as lições dos cursos.
          </p>
        </div>

        {!isAdding && (
          <Button
            onClick={() => {
              if (lessons.length > 0) {
                setNewLessonId(lessons[0].id);
              }
              setIsAdding(true);
            }}
            className="bg-blue-900 hover:bg-blue-800 text-white dark:bg-blue-800 dark:hover:bg-blue-700 inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Nova Questão
          </Button>
        )}
      </div>

      {isAdding ? (
        /* Add Question Form */
        <form
          onSubmit={handleAddQuestion}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 dark:border-slate-800 dark:bg-slate-950"
        >
          <h2 className="font-serif text-sm font-bold text-slate-900 dark:text-white">
            Criar Nova Questão Teológica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Vincular à Lição
              </label>
              <select
                value={newLessonId}
                onChange={(e) => setNewLessonId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
              >
                {lessons.map((les) => (
                  <option key={les.id} value={les.id}>
                    {les.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Resposta Correta
              </label>
              <select
                value={correctIndex}
                onChange={(e) => setCorrectIndex(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
              >
                <option value={0}>Opção 1</option>
                <option value={1}>Opção 2</option>
                <option value={2}>Opção 3</option>
                <option value={3}>Opção 4</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Enunciado / Pergunta
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Qual destas opções descreve o abismo cultural?"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
            />
          </div>

          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Opções de Resposta
            </label>
            {newOptionsText.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-slate-405 font-bold shrink-0">Opção {idx + 1}:</span>
                <input
                  type="text"
                  required
                  placeholder={`Digite a resposta para a opção ${idx + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Explicação Teológica (Feedback Pós-Resposta)
            </label>
            <textarea
              rows={3}
              placeholder="Explique o motivo desta alternativa ser a correta de acordo com a hermenêutica bíblica..."
              value={explanationText}
              onChange={(e) => setExplanationText(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-900 hover:bg-blue-800 text-white dark:bg-blue-800 dark:hover:bg-blue-700"
            >
              Adicionar Questão
            </Button>
          </div>
        </form>
      ) : (
        /* Questions Bank Listing */
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar enunciados ou justificativas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
              >
                <option value="all">Todas Dificuldades</option>
                <option value="easy">Fácil</option>
                <option value="medium">Médio</option>
                <option value="hard">Difícil</option>
              </select>

              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
              >
                <option value="all">Todas as Lições</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredQuizzes.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-400">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Nenhuma questão encontrada</h3>
                <p className="text-xs text-slate-450 mt-1">
                  Experimente remover filtros de lição ou termo digitado.
                </p>
              </div>
            ) : (
              filteredQuizzes.map((quiz) => {
                const lesson = lessons.find((l) => l.id === quiz.lesson_id);
                return (
                  <div
                    key={quiz.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-950 flex flex-col md:flex-row justify-between gap-4"
                  >
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-400 uppercase tracking-wide">
                          ID: {quiz.id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />{" "}
                          {lesson?.title || "Lição Desconhecida"}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                        {quiz.question}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pl-3 border-l-2 border-slate-100 dark:border-slate-850">
                        {quiz.options.map((option, idx) => (
                          <div
                            key={idx}
                            className={`p-1.5 rounded ${idx === quiz.correct_option_index ? "bg-green-50/50 text-green-800 dark:bg-green-950/20 dark:text-green-400 font-bold" : "text-slate-500"}`}
                          >
                            {idx + 1}. {option}
                          </div>
                        ))}
                      </div>

                      {quiz.explanation && (
                        <div className="bg-slate-50/50 rounded-lg p-2.5 text-[10px] text-slate-500 border border-slate-100 dark:bg-slate-900/30 dark:border-slate-850 leading-relaxed">
                          <strong>Justificativa teológica:</strong> {quiz.explanation}
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col items-end justify-between shrink-0">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-bold capitalize ${
                          quiz.difficulty === "hard"
                            ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                            : quiz.difficulty === "medium"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                              : "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                        }`}
                      >
                        {quiz.difficulty || "Fácil"}
                      </span>

                      <button
                        onClick={() => deleteQuiz(quiz.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-red-655 dark:hover:bg-slate-900 transition mt-2"
                        title="Deletar questão"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
