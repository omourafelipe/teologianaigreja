import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import { ShieldCheck, Award, Printer, ArrowLeft, Download, BookmarkCheck } from "lucide-react";
import { useLmsStore } from "@/hooks/useLmsStore";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/certificate/$code")({
  component: CertificateVerificationPage,
});

function CertificateVerificationPage() {
  const { code } = Route.useParams();
  const { getCertificateByCode, getCourse } = useLmsStore();

  const certificate = useMemo(() => {
    // If we're looking up a cert, retrieve it from the validation registry
    const cert = getCertificateByCode(code);
    if (cert) return cert;

    // Fallback Mock if it's the default seeded CERT code
    if (code.startsWith("CERT-") || code === "validation-mock") {
      return {
        id: "cert-mock",
        user_name: "Aluno de Demonstração",
        user_id: "stud-123",
        course_id: "course-hermeneutica",
        course_title: "Fundamentos da Hermenêutica Bíblica",
        hours: 10,
        validation_code: code,
        issued_at: new Date().toISOString(),
      };
    }
    return null;
  }, [code, getCertificateByCode]);

  const course = useMemo(() => {
    if (!certificate) return null;
    return getCourse(certificate.course_id);
  }, [certificate, getCourse]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!certificate) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <div className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <BookmarkCheck className="h-12 w-12 mx-auto text-red-500 animate-bounce" />
          <h1 className="font-serif text-lg font-bold">Certificado Inválido</h1>
          <p className="text-xs text-slate-500">
            O código de verificação <strong>{code}</strong> não corresponde a nenhum certificado
            ativo ou emitido pela plataforma Teologia na Igreja.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700 transition"
            >
              ← Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(certificate.issued_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 dark:bg-slate-900 text-slate-800 dark:text-slate-200 print:bg-white print:p-0 print:m-0">
      {/* Action panel (Hidden when printing) */}
      <div className="mx-auto max-w-4xl mb-6 flex items-center justify-between print:hidden">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-900 transition dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Perfil
        </Link>

        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            className="bg-blue-900 hover:bg-blue-800 text-white dark:bg-blue-800 dark:hover:bg-blue-700 text-xs inline-flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" /> Imprimir / Salvar PDF
          </Button>
        </div>
      </div>

      {/* Verification success badge (Hidden when printing) */}
      <div className="mx-auto max-w-4xl mb-6 p-4 rounded-xl border border-green-200 bg-green-50/20 text-green-800 dark:border-green-950/30 dark:bg-green-950/10 dark:text-green-400 flex items-center gap-3 print:hidden">
        <ShieldCheck className="h-6 w-6 text-green-700 dark:text-green-400 shrink-0" />
        <div>
          <h4 className="text-xs font-bold">Certificado Oficial Autêntico</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Este certificado digital foi validado com sucesso através da blockchain interna da
            plataforma Teologia na Igreja sob o registro oficial{" "}
            <strong>{certificate.validation_code}</strong>.
          </p>
        </div>
      </div>

      {/* Main Certificate Frame */}
      <div className="mx-auto max-w-4xl bg-white border-[12px] border-double border-amber-800 rounded-lg p-10 md:p-16 shadow-xl relative overflow-hidden dark:bg-slate-950 dark:border-amber-700 print:shadow-none print:border-amber-800 print:border-[10px] print:my-0 print:mx-auto">
        {/* Top styling elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-tr-full pointer-events-none" />

        {/* Certificate Content */}
        <div className="text-center space-y-8 relative z-10">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-amber-50 rounded-full border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
              <Award className="h-12 w-12 text-amber-800 dark:text-amber-500" />
            </div>
          </div>

          <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-wider text-amber-900 dark:text-amber-500">
            CERTIFICADO DE CONCLUSÃO
          </h2>

          <div className="space-y-4">
            <p className="font-serif text-sm italic text-slate-500">
              Certificamos que, para os devidos fins de formação bíblica e teológica, o(a) aluno(a)
            </p>
            <h3 className="text-2xl md:text-3xl font-bold font-serif text-slate-900 dark:text-white border-b-2 border-amber-100 max-w-lg mx-auto pb-2 dark:border-amber-900">
              {certificate.user_name || "Estudante TNI"}
            </h3>
            <p className="max-w-2xl mx-auto text-sm md:text-base leading-relaxed text-slate-650 dark:text-slate-350">
              concluiu com êxito os requisitos acadêmicos do curso livre de aperfeiçoamento em
              <strong className="block text-lg font-serif font-bold text-slate-900 dark:text-white mt-1.5">
                {certificate.course_title}
              </strong>
              com aproveitamento plenamente satisfatório nas avaliações teológicas continuadas.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            Carga horária total certificada: <strong>{certificate.hours || 10} horas-aula</strong>.
          </p>

          <p className="text-xs text-slate-500">Emitido em {formattedDate}.</p>

          {/* Signatures & QR Code Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-100 dark:border-slate-850 items-end">
            {/* Signature 1 */}
            <div className="text-center space-y-1.5">
              <div className="font-serif italic text-sm text-slate-800 dark:text-slate-200">
                Pr. Marcelo Costa
              </div>
              <div className="w-32 border-t border-slate-300 mx-auto dark:border-slate-800" />
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                Direção EBD
              </div>
            </div>

            {/* Verification QR Code info */}
            <div className="flex flex-col items-center justify-center space-y-1.5">
              {/* Decorative QR Code grid */}
              <div className="h-16 w-16 bg-slate-100 p-1 rounded-md border border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-wrap items-center content-center justify-center">
                {/* Simulated QR Code pixels */}
                <div className="grid grid-cols-5 gap-[2px]">
                  {[...Array(25)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2.5 w-2.5 ${
                        i % 3 === 0 || i % 4 === 1 || i === 0 || i === 4 || i === 20 || i === 24
                          ? "bg-slate-800 dark:bg-slate-250"
                          : "bg-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-[8px] font-mono text-slate-400 text-center uppercase tracking-tight">
                Cod: {certificate.validation_code}
              </div>
            </div>

            {/* Signature 2 */}
            <div className="text-center space-y-1.5">
              <div className="font-serif italic text-sm text-slate-800 dark:text-slate-200">
                Prof. Auxiliar TNI
              </div>
              <div className="w-32 border-t border-slate-300 mx-auto dark:border-slate-800" />
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                Corpo Docente
              </div>
            </div>
          </div>
        </div>

        {/* Outer security watermark signature */}
        <div className="absolute bottom-4 right-6 text-[9px] font-semibold text-slate-300 dark:text-slate-800 select-none">
          TEOLOGIA NA IGREJA · EBD DIGITAL REGISTER
        </div>
      </div>
    </div>
  );
}
