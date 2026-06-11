import { CheckCircle2, Compass, Sparkles } from "lucide-react";
import type { Poll, PollVote } from "@/types/database.types";

interface LessonFeedbackProps {
  isLessonCompleted: boolean;
  onToggleCompletion: () => void;
  poll: Poll | null;
  userVote: PollVote | null;
  onVote: (optionIdx: number) => void;
  isAssessmentSubmitted: boolean;
  onAssessmentSubmit: (e: React.FormEvent) => void;
  compRating: number;
  setCompRating: (val: number) => void;
  confRating: number;
  setConfRating: (val: number) => void;
  isClarityGood: boolean;
  setIsClarityGood: (val: boolean) => void;
}

export function LessonFeedback({
  isLessonCompleted,
  onToggleCompletion,
  poll,
  userVote,
  onVote,
  isAssessmentSubmitted,
  onAssessmentSubmit,
  compRating,
  setCompRating,
  confRating,
  setConfRating,
  isClarityGood,
  setIsClarityGood,
}: LessonFeedbackProps) {
  const pollVotes = poll ? { total: 0 } : null; // Simulado para render
  
  return (
    <div className="space-y-6">
      {/* CHECKBOX DE CONCLUSÃO */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-850 dark:bg-slate-950/20">
        <label className="flex items-start gap-4 cursor-pointer select-none">
          <div className="relative flex items-center justify-center mt-1">
            <input
              type="checkbox"
              checked={isLessonCompleted}
              onChange={onToggleCompletion}
              className="peer h-5 w-5 rounded border-slate-300 text-blue-900 focus:ring-blue-900/20 dark:border-slate-700 dark:text-blue-400 dark:focus:ring-blue-400/20"
            />
          </div>
          <div className="space-y-1">
            <span className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
              Concluir leitura desta lição
              {isLessonCompleted && (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-450" />
              )}
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Marque esta lição como concluída para registrar seu progresso e ganhar +20 XP!
            </span>
          </div>
        </label>
      </div>

      {/* REFLEXÃO & ENQUETE DO DIA */}
      {poll && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/20 space-y-4">
          <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Compass className="h-4.5 w-4.5 text-blue-900 dark:text-blue-400" /> Enquete de
            Reflexão
          </h3>
          <p className="text-xs font-semibold leading-relaxed text-slate-650 dark:text-slate-400">
            {poll.question}
          </p>

          {userVote ? (
            <div className="space-y-3">
              <p className="text-[10px] text-slate-400 font-bold">
                Voto registrado! Obrigado por participar.
              </p>
              {poll.options.map((option, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span
                      className={
                        userVote.selected_option_index === idx
                          ? "font-bold text-blue-900 dark:text-blue-400"
                          : "text-slate-700 dark:text-slate-300"
                      }
                    >
                      {option}
                    </span>
                    <span className="text-blue-900 dark:text-blue-400">
                      {userVote.selected_option_index === idx ? "Seu Voto" : ""}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${userVote.selected_option_index === idx ? "bg-blue-800 dark:bg-blue-400" : "bg-slate-300 dark:bg-slate-700"}`}
                      style={{
                        width: userVote.selected_option_index === idx ? "100%" : "20%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-2">
              {poll.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => onVote(idx)}
                  className="w-full text-left rounded-xl border border-slate-200 hover:border-slate-350 bg-white p-3.5 text-xs font-medium dark:border-slate-800 dark:bg-slate-900/10 dark:hover:border-slate-750 transition text-slate-700 dark:text-slate-300"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AUTOAVALIAÇÃO REFLEXIVA */}
      {!isAssessmentSubmitted ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/20 space-y-4">
          <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-250 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-yellow-500 fill-current" /> Autoavaliação
            Reflexiva
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
            Como foi o seu aproveitamento nesta leitura? Envie sua resposta para ganhar +10
            XP.
          </p>

          <form
            onSubmit={onAssessmentSubmit}
            className="space-y-4 text-xs font-semibold"
          >
            <div className="space-y-1">
              <span className="block text-slate-650 dark:text-slate-350">
                1. Quanto você compreendeu deste conteúdo?
              </span>
              <select
                value={compRating}
                onChange={(e) => setCompRating(Number(e.target.value))}
                className="w-full rounded border border-slate-250 p-2 dark:border-slate-800 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300"
              >
                <option value={5}>Excelente compreensão (5/5)</option>
                <option value={4}>Boa compreensão (4/5)</option>
                <option value={3}>Compreendi o básico (3/5)</option>
                <option value={2}>Muitas dúvidas (2/5)</option>
                <option value={1}>Não compreendi nada (1/5)</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="block text-slate-650 dark:text-slate-350">
                2. Qual o seu nível de confiança no assunto?
              </span>
              <select
                value={confRating}
                onChange={(e) => setConfRating(Number(e.target.value))}
                className="w-full rounded border border-slate-255 p-2 dark:border-slate-800 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300"
              >
                <option value={5}>Extremamente confiante (5/5)</option>
                <option value={4}>Confiante (4/5)</option>
                <option value={3}>Parcialmente confiante (3/5)</option>
                <option value={2}>Pouco confiante (2/5)</option>
                <option value={1}>Sem confiança (1/5)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/45 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <input
                type="checkbox"
                id="clarityCheck"
                checked={isClarityGood}
                onChange={(e) => setIsClarityGood(e.target.checked)}
                className="rounded border-slate-300 text-blue-900"
              />
              <label
                htmlFor="clarityCheck"
                className="text-[11px] text-slate-650 dark:text-slate-400 select-none cursor-pointer"
              >
                O tema e as definições teológicas foram claros?
              </label>
            </div>

            <button
              type="submit"
              className="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[10px] px-3.5 py-2 uppercase tracking-wide dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition"
            >
              Enviar Autoavaliação
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/20 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/10 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="text-xs text-emerald-900 dark:text-emerald-350">
            <span className="font-bold block mb-0.5">Autoavaliação Enviada!</span>
            Sua resposta foi registrada no painel de analytics pessoal. +10 XP creditado.
          </div>
        </div>
      )}
    </div>
  );
}
