import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BookOpen, GraduationCap, User, ArrowRight, AlertTriangle } from "lucide-react";
import { useLmsStore } from "@/hooks/useLmsStore";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, currentUser } = useLmsStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    if (!email.trim()) {
      setError("Por favor, digite o seu e-mail.");
      return;
    }

    const res = login(email.trim());
    if (!res.success) {
      setError(res.error || "Erro ao fazer login.");
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setError("");
    const res = login(quickEmail);
    if (!res.success) {
      setError(res.error || "Erro ao conectar conta de teste.");
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
            Teologia na Igreja
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-455">
            Plataforma de Leitura e Estudos Teológicos
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
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-slate-700 dark:text-slate-350"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:focus:border-blue-400"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-900 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-800 dark:bg-blue-400 dark:text-slate-900 dark:hover:bg-blue-300 transition"
            >
              Entrar na Conta <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Mock Login Buttons */}
          <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-850">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Acesso Rápido de Testes
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => handleQuickLogin("aluno@ebd.com")}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80"
              >
                <User className="h-4 w-4 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Aluno</span>
                  <span className="block truncate text-[10px]">aluno@ebd.com</span>
                </div>
              </button>

              <button
                onClick={() => handleQuickLogin("professor@ebd.com")}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80"
              >
                <GraduationCap className="h-4 w-4 text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Professor</span>
                  <span className="block truncate text-[10px]">professor@ebd.com</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Não possui uma conta?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-900 hover:underline dark:text-blue-400"
          >
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
