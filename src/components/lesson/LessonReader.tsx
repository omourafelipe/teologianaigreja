import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface LessonReaderProps {
  content: string;
  fontSize: "sm" | "md" | "lg" | "xl";
  readingTheme: "light" | "sepia" | "dark";
}

export function LessonReader({
  content,
  fontSize,
  readingTheme,
}: LessonReaderProps) {
  const fontSizeStyle = () => {
    if (fontSize === "sm") return { fontSize: "14px" };
    if (fontSize === "lg") return { fontSize: "19px" };
    if (fontSize === "xl") return { fontSize: "22px" };
    return { fontSize: "16px" };
  };

  return (
    <div
      className={`prose-reader leading-relaxed ${
        readingTheme === "sepia"
          ? "text-amber-900"
          : readingTheme === "dark"
            ? "text-slate-200"
            : "text-slate-800"
      }`}
      style={fontSizeStyle()}
    >
      <MarkdownRenderer content={content} />
    </div>
  );
}
