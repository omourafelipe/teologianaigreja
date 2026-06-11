import { HelpCircle, CheckCircle2, XCircle, Info } from "lucide-react";
import type { Quiz, Profile, QuizAnswer } from "@/types/database.types";

interface LessonQuizzesProps {
  quizzes: Quiz[];
  currentUser: Profile;
  selectedOptions: Record<string, number>;
  onOptionSelect: (quizId: string, optionIdx: number) => void;
  justSubmitted: Record<string, boolean>;
  onSubmitAnswer: (quiz: Quiz) => void;
  getQuizAnswer: (userId: string, quizId: string) => QuizAnswer | undefined;
}

export function LessonQuizzes({
  quizzes,
  currentUser,
  selectedOptions,
  onOptionSelect,
  justSubmitted,
  onSubmitAnswer,
  getQuizAnswer,
}: LessonQuizzesProps) {
  if (quizzes.length === 0) return null;

  return (
    <div className="space-y-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-blue-900 dark:text-blue-400" />
        <h3 className="font-serif text-lg font-bold text-slate-850 dark:text-slate-200">
          Exercícios de Fixação ({quizzes.length})
        </h3>
      </div>

      <div className="space-y-8">
        {quizzes.map((q, qIndex) => {
          const savedAnswer = getQuizAnswer(currentUser.id, q.id);
          const isSubmitted = !!savedAnswer || !!justSubmitted[q.id];
          const selectedOption = isSubmitted
            ? savedAnswer?.selected_option_index
            : selectedOptions[q.id];

          return (
            <div
              key={q.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/20"
            >
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-relaxed">
                {qIndex + 1}. {q.question}
              </h4>

              <div className="mt-4 space-y-2">
                {q.options.map((option, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrectAnswer = q.correct_option_index === optIdx;

                  let style =
                    "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-900/10 text-slate-700 dark:text-slate-300";
                  let icon = null;

                  if (isSubmitted) {
                    if (isCorrectAnswer) {
                      style =
                        "border-emerald-500 bg-emerald-50/20 text-emerald-950 dark:border-emerald-500/40 dark:bg-emerald-950/20 dark:text-emerald-450 font-bold";
                      icon = (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      );
                    } else if (isSelected) {
                      style =
                        "border-red-400 bg-red-50/20 text-red-950 dark:border-red-500/30 dark:bg-red-950/20 dark:text-red-400";
                      icon = <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
                    } else {
                      style =
                        "border-slate-150 opacity-40 bg-white dark:bg-slate-900/5 cursor-not-allowed text-slate-400 dark:text-slate-500";
                    }
                  } else if (isSelected) {
                    style =
                      "border-blue-900 bg-blue-50/20 dark:border-blue-400 dark:bg-blue-950/20 font-bold text-blue-950 dark:text-blue-300";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => onOptionSelect(q.id, optIdx)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3.5 text-left text-xs transition-all ${style}`}
                    >
                      <span>{option}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {!isSubmitted && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    disabled={selectedOption === undefined}
                    onClick={() => onSubmitAnswer(q)}
                    className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-400 dark:text-slate-900"
                  >
                    Enviar Resposta
                  </button>
                </div>
              )}

              {isSubmitted && q.explanation && (
                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800/80 animate-slide-down">
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/85 dark:bg-slate-900/40 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5 mb-1.5 dark:text-slate-400">
                      <Info className="h-3.5 w-3.5" /> Comentário de Resposta
                    </span>
                    <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-400">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
