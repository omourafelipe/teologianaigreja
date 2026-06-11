import React from "react";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface LessonTOCProps {
  headings: HeadingItem[];
  activeHeadingId: string;
  onHeadingClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}

export function LessonTOC({
  headings,
  activeHeadingId,
  onHeadingClick,
}: LessonTOCProps) {
  if (headings.length === 0) return null;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
        <h2 className="mb-4 font-serif text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Neste Tópico
        </h2>
        <div className="relative border-l border-slate-200 dark:border-slate-800 py-1 space-y-2.5">
          {headings.map((h) => {
            const isActive = activeHeadingId === h.id;
            return (
              <a
                key={h.id}
                href={`#${h.id}`}
                onClick={(e) => onHeadingClick(e, h.id)}
                className={`block text-[11px] transition-all duration-200 hover:text-blue-900 dark:hover:text-blue-400 ${
                  h.level === 3 ? "pl-8" : "pl-4"
                } ${
                  isActive
                    ? "font-bold text-blue-900 dark:text-blue-400 border-l-2 border-blue-900 dark:border-blue-400 -ml-[1px]"
                    : "text-slate-505 border-l border-transparent"
                }`}
              >
                {h.text}
              </a>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
