import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useLmsStore } from "@/hooks/useLmsStore";

export const Route = createFileRoute("/")({
  component: HomeRedirect,
});

function HomeRedirect() {
  const { currentUser } = useLmsStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate({ to: "/login" });
    } else if (currentUser.role === "teacher") {
      navigate({ to: "/admin/dashboard" });
    } else {
      navigate({ to: "/dashboard" });
    }
  }, [currentUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-xs text-slate-400">
      Direcionando...
    </div>
  );
}

