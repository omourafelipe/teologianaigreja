import { useState } from "react";
import { Play, Volume2, FileText, ChevronDown } from "lucide-react";

interface LessonMediaProps {
  contentType?: string;
  mediaUrl?: string;
  transcript?: string;
  pdfUrl?: string;
}

export function LessonMedia({
  contentType,
  mediaUrl,
  transcript,
  pdfUrl,
}: LessonMediaProps) {
  const [mediaSpeed, setMediaSpeed] = useState<number>(1);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);

  if (!mediaUrl && contentType !== "pdf") return null;

  return (
    <div className="space-y-4">
      {contentType === "video" && mediaUrl && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-850 dark:bg-slate-950/20 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Play className="h-4 w-4" /> Bloco de Vídeo da Lição
            </span>

            {/* Velocidade */}
            <select
              value={mediaSpeed}
              onChange={(e) => setMediaSpeed(Number(e.target.value))}
              className="rounded border border-slate-200 py-1 px-2 text-[10px] font-bold dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1.0x (Padrão)</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2.0x</option>
            </select>
          </div>

          <div className="aspect-video relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            <video
              src={mediaUrl}
              controls
              className="w-full h-full object-cover"
              style={{ playbackRate: mediaSpeed } as any}
            />
          </div>

          {transcript && (
            <div className="border-t border-slate-200/50 pt-3 dark:border-slate-800/50">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="flex w-full items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <span>Ver Transcrição do Vídeo</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showTranscript ? "rotate-180" : ""}`}
                />
              </button>
              {showTranscript && (
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-250 dark:border-slate-800 italic">
                  "{transcript}"
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {contentType === "audio" && mediaUrl && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-850 dark:bg-slate-950/20 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Volume2 className="h-4 w-4" /> Bloco de Áudio Integrado
            </span>

            <select
              value={mediaSpeed}
              onChange={(e) => setMediaSpeed(Number(e.target.value))}
              className="rounded border border-slate-200 py-1 px-2 text-[10px] font-bold dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1.0x (Padrão)</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2.0x</option>
            </select>
          </div>
          <audio
            src={mediaUrl}
            controls
            className="w-full"
            style={{ playbackRate: mediaSpeed } as any}
          />
        </div>
      )}

      {contentType === "pdf" && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-850 dark:bg-slate-950/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600 dark:bg-red-950/30 dark:text-red-400 shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Material de Apoio (PDF)
              </h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-400">
                Apostila oficial em PDF para leitura e download.
              </p>
            </div>
          </div>
          <a
            href={pdfUrl || "#"}
            download
            className="rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[10px] px-3.5 py-2 uppercase tracking-wide dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition"
          >
            Baixar PDF
          </a>
        </div>
      )}
    </div>
  );
}
