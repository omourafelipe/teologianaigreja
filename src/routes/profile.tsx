import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Award,
  Trophy,
  Flame,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Share2,
  Eye,
  ShieldCheck,
  BarChart2,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useLmsStore } from "@/hooks/useLmsStore";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

// All possible badges in the game
const BADGES_LIST = [
  {
    id: "Primeiro Passo",
    name: "Primeiro Passo",
    desc: "Alcance 100 XP na plataforma",
    icon: "🌱",
  },
  {
    id: "Leitor Dedicado",
    name: "Leitor Dedicado",
    desc: "Alcance 500 XP na plataforma",
    icon: "📚",
  },
  {
    id: "Teólogo Dedicado",
    name: "Teólogo Dedicado",
    desc: "Destaque por sequência de estudo",
    icon: "🔥",
  },
  { id: "Estudioso", name: "Estudioso", desc: "Alcance o nível de Estudioso", icon: "🎓" },
  { id: "Mestre", name: "Mestre", desc: "Alcance o nível de Mestre", icon: "👑" },
  {
    id: "Membro de Elite",
    name: "Membro de Elite",
    desc: "Faça parte de grupos e debates",
    icon: "⚔️",
  },
];

function ProfilePage() {
  const { currentUser, getCertificates, courses, getCourseProgressPercent, issueCertificate } =
    useLmsStore();
  const navigate = useNavigate();

  // Guard authentication
  useEffect(() => {
    if (!currentUser && typeof window !== "undefined") {
      navigate({ to: "/login" });
    }
  }, [currentUser]);

  if (!currentUser) return null;

  // Level Info calculations
  const levelInfo = useMemo(() => {
    const xp = currentUser.xp || 0;
    let currentLevel = "Iniciante";
    let nextLevel = "Aprendiz";
    let minXp = 0;
    let maxXp = 100;

    if (xp >= 1001) {
      currentLevel = "Mestre";
      nextLevel = "Limite Alcançado";
      minXp = 1001;
      maxXp = 1001;
    } else if (xp >= 601) {
      currentLevel = "Estudioso";
      nextLevel = "Mestre";
      minXp = 601;
      maxXp = 1000;
    } else if (xp >= 301) {
      currentLevel = "Discípulo";
      nextLevel = "Estudioso";
      minXp = 301;
      maxXp = 600;
    } else if (xp >= 101) {
      currentLevel = "Aprendiz";
      nextLevel = "Discípulo";
      minXp = 101;
      maxXp = 300;
    }

    const progressPercent =
      maxXp === minXp ? 100 : Math.round(((xp - minXp) / (maxXp - minXp)) * 100);

    return {
      currentLevel,
      nextLevel,
      minXp,
      maxXp,
      progressPercent,
    };
  }, [currentUser]);

  // Certificates
  const certificates = useMemo(() => {
    return getCertificates(currentUser.id);
  }, [currentUser, getCertificates]);

  // Check if any course is 100% completed, and if so, offer to issue certificate if not already issued
  const eligibleCoursesForCertificate = useMemo(() => {
    return courses.filter((course) => {
      const progress = getCourseProgressPercent(currentUser.id, course.id);
      const alreadyIssued = certificates.some((c) => c.course_id === course.id);
      return progress === 100 && !alreadyIssued;
    });
  }, [courses, currentUser, getCourseProgressPercent, certificates]);

  const handleIssueCertificate = (courseId: string) => {
    issueCertificate(currentUser.id, courseId);
    // Award 50 XP for earning a certificate!
    navigate({ to: `/profile` }); // re-render
  };

  // Mock study metrics weekly chart data
  const chartData = [
    { name: "Seg", XP: 15 },
    { name: "Ter", XP: 45 },
    { name: "Qua", XP: 10 },
    { name: "Qui", XP: 80 },
    { name: "Sex", XP: 35 },
    { name: "Sáb", XP: currentUser.xp ? Math.min(currentUser.xp % 100, 70) : 0 },
    { name: "Dom", XP: currentUser.xp ? Math.min(currentUser.xp % 50, 40) : 0 },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 space-y-8">
        {/* User Top Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center font-serif font-bold text-2xl text-blue-900 dark:text-blue-400">
              {currentUser.name[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                {currentUser.name}
              </h1>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-900 dark:bg-blue-950/40 dark:text-blue-400">
                  {levelInfo.currentLevel}
                </span>
                <span className="text-xs text-slate-400">
                  • Enrolado como {currentUser.role === "teacher" ? "Professor" : "Aluno"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-6 bg-slate-50/50 border border-slate-100 rounded-xl p-4 dark:bg-slate-900/20 dark:border-slate-850">
            <div className="text-center px-2">
              <span className="block text-xs font-semibold text-slate-400">Total XP</span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-400 flex items-center justify-center gap-1 mt-0.5">
                <Trophy className="h-4.5 w-4.5 text-blue-900 dark:text-blue-400" />{" "}
                {currentUser.xp || 0}
              </span>
            </div>
            <div className="text-center border-x border-slate-200 dark:border-slate-800 px-4">
              <span className="block text-xs font-semibold text-slate-400">Streak</span>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1 mt-0.5">
                <Flame className="h-4.5 w-4.5 text-orange-500 fill-current" />{" "}
                {currentUser.streak || 0}d
              </span>
            </div>
            <div className="text-center px-2">
              <span className="block text-xs font-semibold text-slate-400">Recorde</span>
              <span className="text-lg font-bold text-slate-700 dark:text-slate-350 flex items-center justify-center gap-1 mt-0.5">
                <Calendar className="h-4.5 w-4.5 text-slate-500" /> {currentUser.max_streak || 0}d
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left / Middle: Level & Analytics */}
          <div className="md:col-span-2 space-y-6">
            {/* Level progress */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                    Progresso de Nível
                  </h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">
                    Acumule mais XP para subir no ranking de alunos.
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-900 dark:text-blue-400">
                  {currentUser.xp} XP
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3.5 dark:bg-slate-900 overflow-hidden relative border border-slate-250/30 dark:border-slate-800">
                <div
                  className="bg-blue-900 h-full rounded-full transition-all dark:bg-blue-800"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>Nível {levelInfo.currentLevel}</span>
                {levelInfo.maxXp > levelInfo.minXp && (
                  <span>
                    Faltam {levelInfo.maxXp - (currentUser.xp || 0)} XP para Nível{" "}
                    {levelInfo.nextLevel}
                  </span>
                )}
              </div>
            </div>

            {/* Analytics Area Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <BarChart2 className="h-5 w-5 text-blue-900 dark:text-blue-400" /> Tendência de
                Estudos (Esta Semana)
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Média diária de XP obtidos em questionários, lições e participação no fórum.
              </p>

              <div className="h-64 w-full text-xs font-semibold">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                      className="dark:stroke-slate-800"
                    />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ fontSize: "11px", fontWeight: "bold" }} />
                    <Area
                      type="monotone"
                      dataKey="XP"
                      stroke="#1e3a8a"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorXp)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right: Badges / Achievements Gallery */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <Award className="h-5 w-5 text-amber-500" /> Galeria de Medalhas
              </h3>
              <p className="text-[11px] text-slate-450 mb-4">
                Complete as metas e conquiste todas as insígnias.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {BADGES_LIST.map((badge) => {
                  const isEarned =
                    currentUser.badges?.includes(badge.id) ||
                    (badge.id === "Estudioso" && currentUser.level === "Estudioso") ||
                    (badge.id === "Mestre" && currentUser.level === "Mestre");

                  return (
                    <div
                      key={badge.id}
                      className={`flex flex-col items-center text-center p-3 rounded-lg border transition ${
                        isEarned
                          ? "border-amber-100 bg-amber-50/15 dark:border-amber-950/20 dark:bg-amber-950/10"
                          : "border-slate-100 bg-slate-50/10 opacity-40 dark:border-slate-850"
                      }`}
                      title={badge.desc}
                    >
                      <span className="text-2xl mb-1.5">{badge.icon}</span>
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate w-full">
                        {badge.name}
                      </span>
                      <span className="text-[8px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                        {badge.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-900 dark:text-blue-400" /> Seus Certificados
            Digitais
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Certificados gerados automaticamente e verificáveis publicamente com QR Code após
            concluir 100% de um curso.
          </p>

          {/* Emit certificate warning cards if eligible */}
          {eligibleCoursesForCertificate.length > 0 && (
            <div className="mb-6 space-y-2">
              {eligibleCoursesForCertificate.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-green-200 bg-green-50/10 rounded-xl dark:border-green-950/30 dark:bg-green-950/10"
                >
                  <div>
                    <h4 className="text-xs font-bold text-green-800 dark:text-green-400">
                      Parabéns! Carga concluída com sucesso.
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Você completou todas as aulas do curso <strong>{course.title}</strong>.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleIssueCertificate(course.id)}
                    className="bg-green-700 hover:bg-green-600 text-white dark:bg-green-850 dark:hover:bg-green-800 text-xs shrink-0"
                  >
                    Emitir Certificado (+50 XP)
                  </Button>
                </div>
              ))}
            </div>
          )}

          {certificates.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl dark:border-slate-850 text-slate-400">
              <Award className="h-10 w-10 mx-auto mb-2 text-slate-350" />
              <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-slate-250">
                Nenhum certificado emitido
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Conclua 100% de qualquer curso listado no seu painel para gerar seu certificado
                oficial de participação.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/30 p-5 dark:border-slate-800 dark:bg-slate-900/10 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-blue-900 dark:text-blue-400 tracking-wider uppercase">
                      Certificado Oficial
                    </span>
                    <h4 className="font-serif font-bold text-base text-slate-950 dark:text-white mt-1">
                      {cert.course_title || "Fundamentos da Hermenêutica Bíblica"}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Carga Horária: {cert.hours || 10} horas
                    </p>
                    <p className="text-[10px] font-mono text-slate-450 mt-3">
                      Código: {cert.validation_code}
                    </p>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800 mt-4 pt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Emitido em {new Date(cert.issued_at).toLocaleDateString("pt-BR")}
                    </span>
                    <Link
                      to={`/certificate/$code`}
                      params={{ code: cert.validation_code }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Eye className="h-4 w-4" /> Visualizar Certificado
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
