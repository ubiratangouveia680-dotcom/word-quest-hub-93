import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
      { title: "Contato — Bíblia Online" },
      {
        name: "description",
        content: "Fale com a equipe do Bíblia Online: dúvidas, sugestões, correções e parcerias.",
      },
      { property: "og:title", content: "Contato — Bíblia Online" },
      { property: "og:description", content: "Envie dúvidas, sugestões e correções." },
      { property: "og:url", content: url("/contato") },
    ],
    links: [{ rel: "canonical", href: url("/contato") }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">Contato</h1>
        <p className="mt-2 text-muted-foreground">
          Envie dúvidas, sugestões de conteúdo, correções de texto ou propostas de parceria.
        </p>

        {sent ? (
          <div className="surface mt-8 p-6 text-center">
            <p className="font-display text-lg font-semibold">Mensagem registrada</p>
            <p className="mt-2 text-sm text-muted-foreground">
              O envio por e-mail será ativado junto com o backend do portal. Enquanto isso,
              guardamos sua mensagem apenas neste dispositivo.
            </p>
          </div>
        ) : (
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              toast.success("Mensagem registrada");
            }}
          >
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="mensagem">Mensagem</Label>
              <Textarea id="mensagem" required rows={6} className="mt-1" />
            </div>
            <Button type="submit">Enviar</Button>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
