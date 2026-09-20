import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { url } from "@/lib/site";
import { sendContactMessage } from "@/lib/contact.functions";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Fale com a equipe do Bíblia Online" },
      {
        name: "description",
        content:
          "Entre em contato com a equipe editorial do Bíblia Online para tirar dúvidas, enviar sugestões de estudos bíblicos, correções de texto ou propostas de parceria.",
      },
      { property: "og:title", content: "Contato — Bíblia Online" },
      { property: "og:description", content: "Envie suas dúvidas, sugestões e correções." },
      { property: "og:url", content: url("/contato") },
    ],
    links: [{ rel: "canonical", href: url("/contato") }],
  }),
  component: ContactPage,
});

const SUBJECTS = [
  "Dúvida sobre passagem bíblica ou estudo",
  "Sugestão de tema para devocional ou estudo",
  "Correção de digitação ou problema técnico",
  "Proposta de parceria editorial",
  "Outro assunto",
];

export function sanitizeText(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/onload=/gi, "")
    .replace(/onerror=/gi, "");
}

function ContactPage() {
  const { user, profile, isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]!);
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Bot-trap anti-spam
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Preenchimento automático para usuários autenticados
  useEffect(() => {
    if (isAuthenticated) {
      if (!name) {
        const autoName = profile?.name || user?.user_metadata?.name || "";
        if (autoName) setName(autoName);
      }
      if (!email && user?.email) {
        setEmail(user.email);
      }
    }
  }, [isAuthenticated, user, profile]);

  const validate = () => {
    const errs: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || trimmedName.length < 2) {
      errs.name = "Por favor, informe seu nome (mínimo 2 caracteres).";
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = "Por favor, informe um endereço de e-mail válido.";
    }
    if (!trimmedMessage || trimmedMessage.length < 10) {
      errs.message = "Sua mensagem deve conter no mínimo 10 caracteres.";
    } else if (trimmedMessage.length > 5000) {
      errs.message = "A mensagem excede o limite máximo de 5.000 caracteres.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Proteção anti-bot (Honeypot)
    if (honeypot.trim().length > 0) {
      setSent(true);
      return;
    }

    // 2. Validação dos campos
    if (!validate()) {
      toast.error("Por favor, preencha todos os campos obrigatórios corretamente.");
      return;
    }

    // 3. Prevenção de múltiplos envios consecutivos (Cooldown anti-spam de 15s)
    const lastSentAt = localStorage.getItem("bo:last_contact_sent");
    if (lastSentAt) {
      const diff = Date.now() - parseInt(lastSentAt, 10);
      if (diff < 15000) {
        toast.error("Por favor, aguarde alguns segundos antes de enviar outra mensagem.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const cleanName = sanitizeText(name.trim());
      const cleanEmail = sanitizeText(email.trim());
      const cleanSubject = sanitizeText(subject.trim());
      const cleanMessage = sanitizeText(message.trim());

      const res = await sendContactMessage({
        data: {
          name: cleanName,
          email: cleanEmail,
          subject: cleanSubject,
          message: cleanMessage,
          honeypot: honeypot.trim(),
          userId: user?.id || null,
        },
      });

      if (res.success) {
        localStorage.setItem("bo:last_contact_sent", Date.now().toString());
        setSent(true);
        toast.success(res.message || "Mensagem enviada com sucesso! Obrigado pelo contato.");
      } else {
        toast.error(res.message || "Não foi possível enviar sua mensagem. Tente novamente.");
      }
    } catch (err: unknown) {
      console.error("Erro no envio do formulário de contato:", err);
      const errMsg = err instanceof Error ? err.message : "Não foi possível enviar sua mensagem. Tente novamente.";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
          <Mail className="size-4" /> Canal de Atendimento
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Fale Conosco</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Valorizamos sua opinião, correções e sugestões construtivas. Preencha o formulário abaixo
          para entrar em contato com nossa equipe editorial.
        </p>

        {sent ? (
          <div className="surface mt-8 rounded-xl border border-gold/40 p-8 text-center space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gold/15 text-gold">
              <CheckCircle2 className="size-7" />
            </div>
            <h2 className="font-display text-2xl font-semibold">
              Mensagem enviada com sucesso! Obrigado pelo contato.
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Recebemos sua mensagem sobre “<em>{subject}</em>”. Nossa equipe editorial analisará o seu contato e responderá no e-mail informado assim que possível.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSent(false);
                setMessage("");
              }}
              className="mt-2"
            >
              Enviar outra mensagem
            </Button>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Campo invisível Honeypot anti-spam */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website_feedback_bot_trap"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div>
              <Label htmlFor="nome" className="text-sm font-medium">
                Nome completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome ou como prefere ser chamado"
                className={`mt-1.5 h-11 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                aria-required="true"
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Seu e-mail de resposta <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className={`mt-1.5 h-11 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                aria-required="true"
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="assunto" className="text-sm font-medium">
                Assunto <span className="text-destructive">*</span>
              </Label>
              <select
                id="assunto"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1.5 flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mensagem" className="text-sm font-medium">
                  Mensagem detalhada <span className="text-destructive">*</span>
                </Label>
                <span className="text-xs text-muted-foreground">
                  {message.length} / 5000
                </span>
              </div>
              <Textarea
                id="mensagem"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva sua dúvida, sugestão de estudo ou apontamento de correção..."
                rows={6}
                maxLength={5000}
                className={`mt-1.5 resize-y ${errors.message ? "border-destructive focus-visible:ring-destructive" : ""}`}
                aria-required="true"
              />
              {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
            </div>

            <div className="pt-2">
              <Button type="submit" size="lg" className="h-11 px-6 font-medium" disabled={submitting}>
                <Send className="mr-2 size-4" /> {submitting ? "Enviando…" : "Enviar mensagem"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
