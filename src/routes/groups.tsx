import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Users, Send, MessageSquare, Plus, ArrowLeft, ShieldAlert, Check } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useLmsStore } from "@/hooks/useLmsStore";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/groups")({
  component: StudyGroupsPage,
});

function StudyGroupsPage() {
  const { currentUser, studyGroups, toggleGroupJoin, getGroupMessages, sendGroupMessage, awardXp } =
    useLmsStore();
  const navigate = useNavigate();

  // Guard authentication
  useEffect(() => {
    if (!currentUser && typeof window !== "undefined") {
      navigate({ to: "/login" });
    }
  }, [currentUser]);

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const activeGroup = useMemo(() => {
    if (!activeGroupId) return null;
    return studyGroups.find((g) => g.id === activeGroupId) || null;
  }, [activeGroupId, studyGroups]);

  const messages = useMemo(() => {
    if (!activeGroupId) return [];
    return getGroupMessages(activeGroupId);
  }, [activeGroupId, getGroupMessages]);

  useEffect(() => {
    if (studyGroups.length > 0 && !activeGroupId) {
      // Set first group as active default
      setActiveGroupId(studyGroups[0].id);
    }
  }, [studyGroups, activeGroupId]);

  if (!currentUser) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroupId || !messageText.trim()) return;

    sendGroupMessage(activeGroupId, currentUser.id, messageText);
    // Award 2 XP per chat contribution
    awardXp(currentUser.id, 2, "Mensagem no grupo de estudos");
    setMessageText("");
  };

  const handleToggleJoin = (groupId: string) => {
    toggleGroupJoin(groupId, currentUser.id);
    // If joining, award 10 XP
    const group = studyGroups.find((g) => g.id === groupId);
    if (group && !group.joined_by_user) {
      awardXp(currentUser.id, 10, "Participou de grupo de estudos");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-900 dark:text-blue-400" /> Grupos de Estudo
          </h1>
          <p className="text-xs text-slate-500">
            Conecte-se com outros alunos em salas de estudo específicas por temas teológicos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Groups List Sidebar */}
          <div className="space-y-3 md:col-span-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Salas Disponíveis
            </h2>
            <div className="space-y-2">
              {studyGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setActiveGroupId(group.id)}
                  className={`w-full text-left rounded-xl border p-4 transition ${
                    activeGroupId === group.id
                      ? "border-blue-950 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/20"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                      {group.name}
                    </span>
                    {group.joined_by_user && (
                      <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[8px] font-bold text-green-700 dark:bg-green-950/40 dark:text-green-400 flex items-center gap-0.5">
                        <Check className="h-2 w-2" /> Membro
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{group.description}</p>
                  <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-semibold">
                    <span className="capitalize">{group.category}</span>
                    <span>
                      {group.members_count + (group.joined_by_user ? 1 : 0)} participantes
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat / Detail Area */}
          <div className="md:col-span-2">
            {activeGroup ? (
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-[550px] dark:border-slate-800 dark:bg-slate-950">
                {/* Header */}
                <div className="border-b border-slate-100 p-4 dark:border-slate-850 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                      {activeGroup.name}
                    </h3>
                    <p className="text-[11px] text-slate-450 mt-0.5">{activeGroup.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={activeGroup.joined_by_user ? "outline" : "default"}
                    onClick={() => handleToggleJoin(activeGroup.id)}
                    className={
                      activeGroup.joined_by_user
                        ? "text-slate-500"
                        : "bg-blue-900 text-white hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700"
                    }
                  >
                    {activeGroup.joined_by_user ? "Sair do Grupo" : "Entrar no Grupo (+10 XP)"}
                  </Button>
                </div>

                {/* Body: Chat Message History or Join Block */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-900/10">
                  {activeGroup.joined_by_user ? (
                    messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <MessageSquare className="h-8 w-8 mb-2" />
                        <p className="text-xs font-semibold">
                          Tire suas dúvidas ou comente algo com o grupo!
                        </p>
                        <p className="text-[10px] text-slate-450 mt-0.5">
                          Nenhuma mensagem neste quadro ainda.
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isSelf = msg.user_id === currentUser.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                              <span className="font-semibold text-slate-700 dark:text-slate-350">
                                {isSelf ? "Você" : msg.user_name}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div
                              className={`rounded-xl px-4 py-2.5 max-w-[80%] text-sm ${
                                isSelf
                                  ? "bg-blue-900 text-white dark:bg-blue-800"
                                  : "bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-950"
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        );
                      })
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <ShieldAlert className="h-10 w-10 text-blue-900 dark:text-blue-400 mb-3" />
                      <h4 className="font-serif font-bold text-slate-900 dark:text-white">
                        Acesso Restrito
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                        Você precisa entrar no grupo de estudos <strong>{activeGroup.name}</strong>{" "}
                        para ler e enviar mensagens.
                      </p>
                      <Button
                        onClick={() => handleToggleJoin(activeGroup.id)}
                        className="bg-blue-900 hover:bg-blue-800 text-white dark:bg-blue-800 dark:hover:bg-blue-700"
                      >
                        Entrar no Grupo agora
                      </Button>
                    </div>
                  )}
                </div>

                {/* Footer Input */}
                {activeGroup.joined_by_user && (
                  <form
                    onSubmit={handleSendMessage}
                    className="border-t border-slate-100 p-3 dark:border-slate-850 flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Envie uma mensagem..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-blue-900 text-white hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700 shrink-0"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[550px] border border-dashed border-slate-200 rounded-xl bg-white dark:border-slate-850 dark:bg-slate-950 text-slate-400">
                <Users className="h-12 w-12 mb-2" />
                <p className="text-sm font-semibold">Selecione uma sala de estudos</p>
                <p className="text-xs text-slate-450">
                  Escolha uma sala ao lado para ver o painel de discussões.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
