import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BookOpen, ArrowRight, AlertTriangle } from "lucide-react";
import { useLmsStore } from "@/hooks/useLmsStore";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { register, currentUser } = useLmsStore();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [error, setError] = useState("");

  // Redireciona se já estiver conectado
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "teacher") {
        navigate({ to: "/admin/dashboard" });
      } else {
        navigate({ to: "/dashboard" });
      }
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Por favor, digite o seu nome.");
      return;
    }
    if (!email.trim()) {
      setError("Por favor, digite o seu e-mail.");
      return;
    }

    const res = register(name.trim(), email.trim(), role);
    if (!res.success) {
      setError(res.error || "Erro ao fazer cadastro.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white dark:bg-blue-400 dark:text-slate-900">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Criar Conta
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-455">
            Cadastre-se na Escola Bíblica Digital
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-850 dark:bg-slate-900/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 dark:bg-red-950/20 dark:text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-semibold text-slate-700 dark:text-slate-350"
              >
                Nome Completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-slate-700 dark:text-slate-350"
              >
                Endereço de E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="role"
                className="text-xs font-semibold text-slate-700 dark:text-slate-350"
              >
                Tipo de Perfil
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "student" | "teacher")}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400"
              >
                <option value="student">Aluno (Estudante)</option>
                <option value="teacher">Professor (Administrador)</option>
              </select>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-900 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition"
            >
              Criar minha conta <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          Já possui uma conta?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-900 hover:underline dark:text-blue-400"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
