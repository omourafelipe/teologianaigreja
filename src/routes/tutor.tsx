import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Bot, Send, Sparkles, BookOpen, RotateCcw, HelpCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useLmsStore } from "@/hooks/useLmsStore";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/tutor")({
  component: TutorPage,
});

interface ChatMessage {
  id: string;
  sender: "user" | "tutor";
  text: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  { text: "Explique a diferença entre Exegese e Eisegese", icon: "📖" },
  { text: "O que são os três abismos interpretativos?", icon: "🌉" },
  { text: "Dê um resumo teológico sobre a história da igreja no Império Romano", icon: "⛪" },
];

function TutorPage() {
  const { currentUser, sendTutorMessage, awardXp } = useLmsStore();
  const navigate = useNavigate();

  // Guard authentication
  useEffect(() => {
    if (!currentUser && typeof window !== "undefined") {
      navigate({ to: "/login" });
    }
  }, [currentUser]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "tutor",
      text: "Olá! Sou o seu Tutor IA de Teologia. Estou aqui para ajudar você a aprofundar seus estudos, explicar conceitos teológicos e responder a qualquer dúvida sobre exegese, hermenêutica ou história da igreja. O que gostaria de explorar hoje?",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!currentUser) return null;

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Math.random().toString(36).substring(2, 9),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      // Get AI explanation
      const responseText = await sendTutorMessage("", text);
      const tutorMsg: ChatMessage = {
        id: "msg-" + Math.random().toString(36).substring(2, 9),
        sender: "tutor",
        text: responseText,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, tutorMsg]);
      // Award 3 XP for interacting with the AI Tutor
      awardXp(currentUser.id, 3, "Interação com o Tutor IA");
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: "msg-err",
        sender: "tutor",
        text: "Desculpe, ocorreu um erro ao contatar o Tutor IA. Por favor, tente novamente.",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "tutor",
        text: "Histórico limpo. Olá! Sou o seu Tutor IA de Teologia. Em que posso ajudar na sua caminhada teológica?",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Presets and Guidance sidebar */}
          <div className="w-full md:w-64 shrink-0 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <h2 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
                <Sparkles className="h-4 w-4 text-amber-500" /> Tópicos Sugeridos
              </h2>
              <div className="space-y-2">
                {PRESET_PROMPTS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(preset.text)}
                    disabled={isLoading}
                    className="w-full text-left rounded-lg border border-slate-100 p-2.5 text-xs text-slate-650 transition hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900/40 dark:hover:bg-slate-900"
                  >
                    <span className="mr-1">{preset.icon}</span> {preset.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/20 text-[11px] text-slate-500">
              <h3 className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-350 mb-1.5">
                <HelpCircle className="h-3.5 w-3.5" /> Dica de Estudo
              </h3>
              <p className="leading-relaxed">
                Você pode pedir resumos, explicações detalhadas de versículos em grego/hebraico
                clássico, e tirar dúvidas hermenêuticas. Cada interação ajuda a consolidar o seu
                progresso teológico!
              </p>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm h-[600px] overflow-hidden dark:border-slate-800 dark:bg-slate-950">
            {/* Header */}
            <div className="border-b border-slate-150 p-4 dark:border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                  <Bot className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    Tutor Teológico IA
                  </h3>
                  <span className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block animate-ping"></span>{" "}
                    Online
                  </span>
                </div>
              </div>

              <button
                onClick={handleClearChat}
                title="Limpar Conversa"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20 dark:bg-slate-900/10">
              {messages.map((msg) => {
                const isTutor = msg.sender === "tutor";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${isTutor ? "" : "ml-auto flex-row-reverse text-right"}`}
                  >
                    {isTutor && (
                      <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center shrink-0 text-xs">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div
                        className={`rounded-xl px-4 py-2.5 text-sm ${
                          isTutor
                            ? "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
                            : "bg-blue-900 text-white dark:bg-blue-800"
                        } whitespace-pre-wrap leading-relaxed`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 block px-1">{msg.timestamp}</span>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 max-w-[80%]">
                  <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center shrink-0 text-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-slate-100 rounded-xl px-4 py-3 text-xs text-slate-500 dark:bg-slate-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"></span>
                    <span>Tutor está digitando...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="border-t border-slate-150 p-3 dark:border-slate-850 flex gap-2"
            >
              <input
                type="text"
                disabled={isLoading}
                placeholder="Pergunte ao tutor... Ex: Qual a diferença entre exegese e eisegese?"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !inputText.trim()}
                className="bg-blue-900 text-white hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
