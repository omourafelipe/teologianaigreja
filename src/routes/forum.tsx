import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  MessageSquare,
  Heart,
  Plus,
  Search,
  ArrowLeft,
  Send,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useLmsStore } from "@/hooks/useLmsStore";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/forum")({
  component: ForumPage,
});

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "duvidas", label: "Dúvidas" },
  { id: "debates", label: "Debates" },
  { id: "testemunhos", label: "Testemunhos" },
  { id: "sugestoes", label: "Sugestões" },
];

function ForumPage() {
  const { currentUser, forumTopics, getForumReplies, addForumReply, createForumTopic, awardXp } =
    useLmsStore();
  const navigate = useNavigate();

  // Guard authentication
  useEffect(() => {
    if (!currentUser && typeof window !== "undefined") {
      navigate({ to: "/login" });
    }
  }, [currentUser]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  // New topic form states
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<
    "duvidas" | "debates" | "testemunhos" | "sugestoes"
  >("duvidas");
  const [newContent, setNewContent] = useState("");

  // New reply form state
  const [newReplyContent, setNewReplyContent] = useState("");

  const selectedTopic = useMemo(() => {
    if (!selectedTopicId) return null;
    return forumTopics.find((t) => t.id === selectedTopicId) || null;
  }, [selectedTopicId, forumTopics]);

  const topicReplies = useMemo(() => {
    if (!selectedTopicId) return [];
    return getForumReplies(selectedTopicId);
  }, [selectedTopicId, getForumReplies]);

  // Filter topics
  const filteredTopics = useMemo(() => {
    return forumTopics.filter((t) => {
      const matchCat = selectedCategory === "all" || t.category === selectedCategory;
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.user_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [forumTopics, selectedCategory, searchQuery]);

  if (!currentUser) return null;

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const topic = createForumTopic(currentUser.id, newCategory, newTitle, newContent);
    // Award 15 XP for starting a debate/discussion
    awardXp(currentUser.id, 15, "Novo tópico no fórum");

    setNewTitle("");
    setNewContent("");
    setIsCreatingTopic(false);
    setSelectedTopicId(topic.id);
  };

  const handleCreateReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicId || !newReplyContent.trim()) return;

    addForumReply(currentUser.id, selectedTopicId, newReplyContent);
    // Award 5 XP for contributing
    awardXp(currentUser.id, 5, "Nova resposta no fórum");
    setNewReplyContent("");
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {selectedTopic ? (
          /* Detailed Topic View */
          <div className="space-y-6">
            <button
              onClick={() => setSelectedTopicId(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-900 transition dark:hover:text-blue-400"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar ao Fórum
            </button>

            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-400">
                    {selectedTopic.user_name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {selectedTopic.user_name}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                          selectedTopic.user_role === "teacher"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                        }`}
                      >
                        {selectedTopic.user_role === "teacher" ? "Professor" : "Aluno"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(selectedTopic.created_at).toLocaleDateString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <span className="capitalize rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                  {selectedTopic.category}
                </span>
              </div>

              <h1 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-3">
                {selectedTopic.title}
              </h1>

              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-650 dark:text-slate-300">
                {selectedTopic.content}
              </p>
            </article>

            {/* Replies section */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Respostas ({topicReplies.length})
              </h3>

              <div className="space-y-3">
                {topicReplies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-lg text-slate-400 dark:border-slate-800">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    <p className="text-xs">Nenhuma resposta ainda. Seja o primeiro a responder!</p>
                  </div>
                ) : (
                  topicReplies.map((reply) => (
                    <div
                      key={reply.id}
                      className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-900/40"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-350">
                          {reply.user_name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              {reply.user_name}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-1 py-0.2 text-[8px] font-bold ${
                                reply.user_role === "teacher"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                              }`}
                            >
                              {reply.user_role === "teacher" ? "Professor" : "Aluno"}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-450">
                            {new Date(reply.created_at).toLocaleDateString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 pl-9 whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleCreateReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escreva sua resposta..."
                  value={newReplyContent}
                  onChange={(e) => setNewReplyContent(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-900 text-white hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-1.5" /> Responder
                </Button>
              </form>
            </div>
          </div>
        ) : (
          /* Forum List / Creating view */
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Fórum de Teologia
                </h1>
                <p className="text-xs text-slate-500">
                  Participe das discussões teológicas, tire dúvidas e compartilhe testemunhos com a
                  comunidade.
                </p>
              </div>

              {!isCreatingTopic && (
                <Button
                  onClick={() => setIsCreatingTopic(true)}
                  className="bg-blue-900 hover:bg-blue-800 text-white inline-flex items-center gap-1.5 dark:bg-blue-800 dark:hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" /> Novo Tópico
                </Button>
              )}
            </div>

            {isCreatingTopic ? (
              /* New Topic Form */
              <form
                onSubmit={handleCreateTopic}
                className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" /> Criar Novo Tópico de Discussão
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1">
                      Título do Tópico
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Qual o significado histórico de Pax Romana?"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1">
                      Categoria
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e: any) => setNewCategory(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                    >
                      <option value="duvidas">Dúvidas</option>
                      <option value="debates">Debates</option>
                      <option value="testemunhos">Testemunhos</option>
                      <option value="sugestoes">Sugestões</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1">
                    Conteúdo
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Descreva detalhadamente seu ponto ou dúvida..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreatingTopic(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-900 text-white hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700"
                  >
                    Publicar Tópico (+15 XP)
                  </Button>
                </div>
              </form>
            ) : (
              /* Topic list with category filters */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 w-full sm:w-auto">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition shrink-0 ${
                          selectedCategory === cat.id
                            ? "bg-blue-900 text-white dark:bg-blue-800"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-850"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar discussões..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Topics Loop */}
                <div className="space-y-3">
                  {filteredTopics.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-white dark:border-slate-800 dark:bg-slate-950">
                      <AlertCircle className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <h3 className="font-semibold text-sm">Nenhum tópico encontrado</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Experimente mudar o filtro ou pesquisar outro termo.
                      </p>
                    </div>
                  ) : (
                    filteredTopics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => setSelectedTopicId(topic.id)}
                        className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 transition cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-350">
                              {topic.user_name}
                            </span>
                            <span>•</span>
                            <span>{new Date(topic.created_at).toLocaleDateString("pt-BR")}</span>
                          </div>
                          <span className="capitalize rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                            {topic.category}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-slate-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-400 transition text-base">
                          {topic.title}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 mb-4">
                          {topic.content}
                        </p>

                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 border-t border-slate-100 pt-3 dark:border-slate-850">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {getForumReplies(topic.id).length} respostas
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5 text-red-400" />
                            {topic.likes} curtidas
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
