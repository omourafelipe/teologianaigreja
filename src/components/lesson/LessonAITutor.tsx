import { Bot, Send } from "lucide-react";

interface LessonAITutorProps {
  onSubmitQuery: (e: React.FormEvent) => void;
  aiPrompt: string;
  setAiPrompt: (val: string) => void;
  aiResponse: string;
  isAiLoading: boolean;
}

export function LessonAITutor({
  onSubmitQuery,
  aiPrompt,
  setAiPrompt,
  aiResponse,
  isAiLoading,
}: LessonAITutorProps) {
  return (
    <div className="rounded-2xl border border-blue-900/30 bg-blue-50/10 p-5 dark:border-blue-500/20 dark:bg-slate-950/20 space-y-4">
      <h3 className="font-serif text-sm font-bold text-blue-950 dark:text-blue-400 flex items-center gap-1.5">
        <Bot className="h-4.5 w-4.5" /> Tutor Educacional IA
      </h3>
      <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-normal">
        Tem alguma dúvida conceitual, histórica ou exegética sobre esta lição? Pergunte ao
        assistente virtual.
      </p>

      {aiResponse && (
        <div className="rounded-xl bg-slate-100 p-4 border border-slate-250 dark:bg-slate-900/40 dark:border-slate-800 animate-slide-down">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
            <Bot className="h-3.5 w-3.5" /> Explicação do Tutor
          </span>
          <p className="text-xs leading-relaxed text-slate-755 dark:text-slate-300 font-serif whitespace-pre-line">
            {aiResponse}
          </p>
        </div>
      )}

      <form onSubmit={onSubmitQuery} className="flex gap-2">
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Ex: Qual o contexto da exegese no texto? ou Resuma a lição..."
          className="flex-1 rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs placeholder:text-slate-450 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 text-slate-800 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isAiLoading || !aiPrompt.trim()}
          className="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[10px] px-4 py-2 uppercase tracking-wide disabled:opacity-50 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          {isAiLoading ? "Processando..." : "Perguntar"} <Send className="h-3 w-3" />
        </button>
      </form>
    </div>
  );
}
