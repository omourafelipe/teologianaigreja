import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Award,
  ShieldAlert,
  Heart,
  Flame,
  GraduationCap,
  Check,
} from "lucide-react";
import { useLmsStore } from "@/hooks/useLmsStore";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { profiles, getCertificates, courses, getCourseProgressPercent } = useLmsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    return profiles.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === "all" || p.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [profiles, searchQuery, roleFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-900 dark:text-blue-400" /> Gestão de Alunos &
          Progresso
        </h1>
        <p className="text-xs text-slate-500">
          Acompanhe o nível, XP acumulado, sequência diária de estudos e certificados dos alunos
          cadastrados.
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["all", "student", "teacher", "admin"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition shrink-0 ${
                roleFilter === role
                  ? "bg-blue-900 text-white dark:bg-blue-800"
                  : "bg-slate-100 text-slate-655 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              {role === "all"
                ? "Todos"
                : role === "student"
                  ? "Alunos"
                  : role === "teacher"
                    ? "Professores"
                    : "Admins"}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-455 text-[10px] uppercase font-bold tracking-wider dark:border-slate-850 dark:bg-slate-900/50">
                <th className="px-5 py-3.5">Nome / E-mail</th>
                <th className="px-5 py-3.5">Cargo</th>
                <th className="px-5 py-3.5 text-center">Nível / XP</th>
                <th className="px-5 py-3.5 text-center">Streak Diário</th>
                <th className="px-5 py-3.5">Progresso de Cursos</th>
                <th className="px-5 py-3.5 text-center">Certificados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-850 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-450">
                    Nenhum aluno encontrado correspondente aos filtros.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const certs = getCertificates(user.id);

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-905 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{user.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold capitalize ${
                            user.role === "teacher"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                              : user.role === "admin"
                                ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                          }`}
                        >
                          {user.role === "student"
                            ? "Aluno"
                            : user.role === "teacher"
                              ? "Professor"
                              : user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {user.level || "Iniciante"}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                          {user.xp || 0} XP
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {user.streak && user.streak > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-orange-600 dark:text-orange-400">
                            <Flame className="h-3.5 w-3.5 fill-current" /> {user.streak} dias
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 min-w-[200px]">
                        <div className="space-y-1.5">
                          {courses.map((course) => {
                            const percent = getCourseProgressPercent(user.id, course.id);
                            return (
                              <div key={course.id} className="flex items-center gap-2">
                                <span
                                  className="text-[10px] font-semibold text-slate-500 truncate max-w-[100px]"
                                  title={course.title}
                                >
                                  {course.title}
                                </span>
                                <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
                                  <div
                                    className={`h-full rounded-full ${percent === 100 ? "bg-green-600" : "bg-blue-900 dark:bg-blue-800"}`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <span
                                  className={`text-[9px] font-bold shrink-0 ${percent === 100 ? "text-green-600 font-extrabold" : "text-slate-450"}`}
                                >
                                  {percent}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {certs.length > 0 ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-bold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                            <Award className="h-3 w-3" /> {certs.length} emitido
                            {certs.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Nenhum</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
