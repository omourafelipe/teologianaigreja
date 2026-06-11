import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/course/$courseId/lesson/$lessonId")({
  component: LessonPage,
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/lesson/$lessonId", params: { lessonId } });
  }, [lessonId, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-xs text-slate-400 animate-pulse">
        Redirecionando para a sala de leitura...
      </div>
    </div>
  );
}
