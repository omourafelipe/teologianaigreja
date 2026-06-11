import React from "react";
import { MessageCircle, Heart } from "lucide-react";
import type { Comment, Profile } from "@/types/database.types";

interface LessonCommentsProps {
  comments: Comment[];
  newComment: string;
  setNewComment: (val: string) => void;
  onAddComment: (e: React.FormEvent) => void;
  onToggleLike: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUser: Profile;
}

export function LessonComments({
  comments,
  newComment,
  setNewComment,
  onAddComment,
  onToggleLike,
  onDeleteComment,
  currentUser,
}: LessonCommentsProps) {
  return (
    <div className="space-y-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-blue-900 dark:text-blue-400" /> Discussão
        da Lição ({comments.length})
      </h3>

      <form onSubmit={onAddComment} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Deixe uma pergunta, contribuição ou saudação..."
          className="flex-1 rounded-xl border border-slate-250 bg-white py-2 px-3 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-none text-slate-850"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[10px] px-4 py-2 uppercase tracking-wide dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition cursor-pointer"
        >
          Comentar
        </button>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-450 italic text-center py-4">
            Nenhum comentário nesta lição ainda. Seja o primeiro a participar!
          </p>
        ) : (
          comments.map((com) => {
            const hasLiked = com.liked_by.includes(currentUser.id);
            return (
              <div
                key={com.id}
                className="bg-slate-50/50 dark:bg-slate-950/20 rounded-xl p-4 border border-slate-200 dark:border-slate-850 flex gap-3"
              >
                <div className="h-7 w-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {com.user_name[0]}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-200">
                        {com.user_name}
                      </span>
                      <span className="text-[8px] font-bold bg-slate-200/50 dark:bg-slate-800 px-1 rounded text-slate-500 uppercase tracking-tight">
                        {com.user_role}
                      </span>
                    </div>
                    <span className="text-[8px] text-slate-400">
                      {new Date(com.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-400">
                    {com.content}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[10px] font-bold">
                    <button
                      onClick={() => onToggleLike(com.id)}
                      className={`flex items-center gap-1 cursor-pointer ${hasLiked ? "text-red-500" : "text-slate-400 hover:text-red-500"}`}
                    >
                      <Heart className={`h-3 w-3 ${hasLiked ? "fill-current" : ""}`} />
                      <span>{com.likes}</span>
                    </button>

                    {currentUser.role === "teacher" && (
                      <button
                        onClick={() => onDeleteComment(com.id)}
                        className="text-red-500 hover:text-red-750 ml-auto text-[9px] cursor-pointer"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
