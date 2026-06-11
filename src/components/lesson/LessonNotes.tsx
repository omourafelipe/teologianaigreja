import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import type { LessonNote } from "@/types/database.types";

interface LessonNotesProps {
  notes: LessonNote[];
  newNote: string;
  setNewNote: (val: string) => void;
  onAddNote: (e: React.FormEvent) => void;
  onDeleteNote: (noteId: string) => void;
}

export function LessonNotes({
  notes,
  newNote,
  setNewNote,
  onAddNote,
  onDeleteNote,
}: LessonNotesProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/20 space-y-4">
      <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
        <Edit2 className="h-4.5 w-4.5 text-blue-900 dark:text-blue-400" /> Suas Notas
        Pessoais
      </h3>

      <form onSubmit={onAddNote} className="space-y-3">
        <textarea
          rows={2}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Escreva uma reflexão, anotação ou esboço teológico para salvar no seu perfil..."
          className="w-full rounded-xl border border-slate-250 bg-white p-3 text-xs placeholder:text-slate-455 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 text-slate-850"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[10px] px-3.5 py-2 uppercase tracking-wide dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition cursor-pointer"
          >
            Salvar Nota
          </button>
        </div>
      </form>

      {notes.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex justify-between gap-4 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-200 dark:border-slate-800"
            >
              <div className="space-y-1">
                <p className="text-xs text-slate-705 dark:text-slate-350">
                  {note.content}
                </p>
                <span className="block text-[8px] text-slate-400">
                  Salvo em {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => onDeleteNote(note.id)}
                className="text-red-500 hover:text-red-750 shrink-0 self-start p-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
