import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { url } from "@/lib/site";

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

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]!);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = "Por favor, informe seu nome (mínimo 2 caracteres).";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Por favor, informe um endereço de e-mail válido.";
    }
    if (!message.trim() || message.trim().length < 10) {
      errs.message = "Sua mensagem deve conter no mínimo 10 caracteres.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Por favor, preencha todos os campos obrigatórios corretamente.");
      return;
    }

    // Armazenamento local seguro sem fingir disparo de SMTP inexistente
    try {
      const stored = JSON.parse(localStorage.getItem("biblia_contact_drafts") || "[]");
      stored.push({
        name,
        email,
        subject,
        message,
        date: new Date().toISOString(),
      });
      localStorage.setItem("biblia_contact_drafts", JSON.stringify(stored));
    } catch {
      // Falha silenciosa de storage
    }

    setSent(true);
    toast.success("Mensagem registrada com sucesso!");
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
            <h2 className="font-display text-2xl font-semibold">Mensagem Registrada</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Obrigado pelo seu contato, <strong>{name}</strong>! Sua mensagem sobre “<em>{subject}</em>” foi armazenada
              com sucesso neste navegador. A infraestrutura de entrega direta de e-mail será conectada junto com as chaves
              do servidor em produção.
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
              <Label htmlFor="mensagem" className="text-sm font-medium">
                Mensagem detalhada <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="mensagem"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva sua dúvida, sugestão de estudo ou apontamento de correção..."
                rows={6}
                className={`mt-1.5 resize-y ${errors.message ? "border-destructive focus-visible:ring-destructive" : ""}`}
                aria-required="true"
              />
              {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
            </div>

            <div className="pt-2">
              <Button type="submit" size="lg" className="h-11 px-6">
                <Send className="mr-2 size-4" /> Enviar mensagem
              </Button>
            </div>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}

