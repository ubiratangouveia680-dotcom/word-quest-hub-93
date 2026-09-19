import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AD_SLOT_LABELS, validateAdSettingsInput, type AdSlotName } from "@/lib/ads-config";
import { useAdSettings } from "@/lib/ads-context";
import { getIsAdmin, updateAdSettings } from "@/lib/ads.functions";
import { supabase } from "@/integrations/supabase/client";
import { DEVOTIONALS, PRAYERS, STUDIES } from "@/lib/content";
import { BIBLE_BOOKS } from "@/lib/bible-books";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo — Bíblia Online" },
      { name: "description", content: "Área administrativa do portal Bíblia Online." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}

const SLOT_ORDER: AdSlotName[] = ["banner", "mobile", "desktop", "inArticle", "endOfChapter"];

function AdsForm() {
  const router = useRouter();
  const current = useAdSettings();
  const save = useServerFn(updateAdSettings);
  const [enabled, setEnabled] = useState(current.enabled);
  const [publisherId, setPublisherId] = useState(current.publisherId);
  const [gaMeasurementId, setGaMeasurementId] = useState(current.gaMeasurementId);
  const [adsTxt, setAdsTxt] = useState(current.adsTxt);
  const [slots, setSlots] = useState<Record<AdSlotName, string>>(current.slots);

  const mutation = useMutation({
    mutationFn: () =>
      save({ data: { enabled, publisherId, slots, gaMeasurementId, adsTxt } }),
    onSuccess: () => {
      toast.success("Configurações de anúncios salvas.");
      router.invalidate();
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Falha ao salvar."),
  });

  const errors = validateAdSettingsInput({ publisherId, slots, gaMeasurementId });
  const configured = Boolean(publisherId && SLOT_ORDER.some((s) => slots[s]));

  return (
    <form
      className="surface mt-5 space-y-5 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (errors.length > 0) {
          toast.error(errors[0] as string);
          return;
        }
        mutation.mutate();
      }}
    >
      <div>
        <h2 className="font-display text-xl font-semibold">Publicidade (Google AdSense)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Os IDs são gravados no banco e usados no site inteiro. Somente administradores podem
          alterá-los; a validação também é feita no servidor.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <Label htmlFor="ads-enabled">Exibir anúncios no site</Label>
          <p className="text-xs text-muted-foreground">
            Desative para ocultar todos os blocos (inclusive os espaços reservados).
          </p>
        </div>
        <Switch id="ads-enabled" checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="publisher">Publisher ID</Label>
        <Input
          id="publisher"
          placeholder="ca-pub-0000000000000000"
          value={publisherId}
          onChange={(e) => setPublisherId(e.target.value.trim())}
          inputMode="text"
        />
        <p className="text-xs text-muted-foreground">
          Encontrado no AdSense em Conta → Informações da conta.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SLOT_ORDER.map((slot) => (
          <div key={slot} className="space-y-1.5">
            <Label htmlFor={`slot-${slot}`}>{AD_SLOT_LABELS[slot]}</Label>
            <Input
              id={`slot-${slot}`}
              placeholder="1234567890"
              value={slots[slot]}
              onChange={(e) => setSlots({ ...slots, [slot]: e.target.value.trim() })}
              inputMode="numeric"
            />
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ga">ID do Google Analytics (opcional)</Label>
        <Input
          id="ga"
          placeholder="G-XXXXXXXXXX"
          value={gaMeasurementId}
          onChange={(e) => setGaMeasurementId(e.target.value.trim())}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="adstxt">Conteúdo do ads.txt</Label>
        <Textarea
          id="adstxt"
          rows={3}
          placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
          value={adsTxt}
          onChange={(e) => setAdsTxt(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Publicado automaticamente em{" "}
          <a href="/ads.txt" className="underline" target="_blank" rel="noreferrer">
            /ads.txt
          </a>
          . Se ficar vazio, a linha é gerada a partir do Publisher ID.
        </p>
      </div>

      {errors.length > 0 && (
        <ul className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={mutation.isPending || errors.length > 0}>
          {mutation.isPending ? "Salvando…" : "Salvar configurações"}
        </Button>
        <span className="text-xs text-muted-foreground">
          Status atual: {configured ? "anúncios configurados" : "espaços reservados"}
          {current.updatedAt
            ? ` · atualizado em ${new Date(current.updatedAt).toLocaleString("pt-BR")}`
            : ""}
        </span>
      </div>
    </form>
  );
}

function AdminPage() {
  const settings = useAdSettings();
  const [session, setSession] = useState<{ email: string | null } | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) =>
      setSession(data.session ? { email: data.session.user.email ?? null } : null),
    );
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s ? { email: s.user.email ?? null } : null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const adminQuery = useQuery({
    queryKey: ["is-admin", session?.email ?? null],
    queryFn: () => getIsAdmin(),
    enabled: Boolean(session),
    retry: false,
  });

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">Painel administrativo</h1>

        {session === undefined && (
          <p className="mt-2 text-sm text-muted-foreground">Verificando acesso…</p>
        )}

        {session === null && (
          <div className="surface mt-5 p-5">
            <p className="text-sm text-muted-foreground">
              Entre com uma conta de administrador para configurar os anúncios.
            </p>
            <Button asChild className="mt-4">
              <Link to="/auth">Entrar</Link>
            </Button>
          </div>
        )}

        {session && adminQuery.data?.isAdmin === false && (
          <div className="surface mt-5 p-5">
            <p className="text-sm text-muted-foreground">
              A conta <strong>{session.email}</strong> não tem permissão de administrador. Peça a
              um administrador para conceder o papel <code>admin</code> a este usuário.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={async () => {
                await supabase.auth.signOut();
              }}
            >
              Sair
            </Button>
          </div>
        )}

        {session && adminQuery.data?.isAdmin && (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Conectado como <strong>{session.email}</strong>.{" "}
              <button
                className="underline"
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
              >
                Sair
              </button>
            </p>
            <AdsForm />
          </>
        )}

        {/* ADMINISTRAÇÃO DAS NOTIFICAÇÕES DO VERSÍCULO DO DIA */}
        <section className="surface mt-5 p-5 rounded-xl border border-border">
          <h2 className="font-display text-xl font-semibold">Notificações do Versículo do Dia</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Controle de envio, horários padrão e integridade dos envios (Manhã, Tarde e Noite).
          </p>
          <div className="mt-4 space-y-2">
            <Row label="Envios automáticos" value="Habilitados (08:00, 12:00, 20:00)" />
            <Row label="Fuso horário base" value="Horário local do dispositivo (America/Sao_Paulo)" />
            <Row label="Controle de duplicidade" value="Ativo (Idempotência por data e período)" />
            <Row label="Mecanismo de entrega" value="Web Push API & Service Worker (/sw.js)" />
          </div>
        </section>

        <section className="surface mt-5 p-5">
          <h2 className="font-display text-xl font-semibold">Conteúdo publicado</h2>
          <div className="mt-3">
            <Row label="Livros da Bíblia" value={String(BIBLE_BOOKS.length)} />
            <Row label="Estudos" value={String(STUDIES.length)} />
            <Row label="Devocionais" value={String(DEVOTIONALS.length)} />
            <Row label="Orações" value={String(PRAYERS.length)} />
          </div>
        </section>

        <section className="surface mt-5 p-5">
          <h2 className="font-display text-xl font-semibold">Situação atual dos anúncios</h2>
          <div className="mt-3">
            <Row label="Anúncios habilitados" value={settings.enabled ? "sim" : "não"} />
            <Row label="Publisher ID" value={settings.publisherId || "não configurado"} />
            {SLOT_ORDER.map((slot) => (
              <Row
                key={slot}
                label={AD_SLOT_LABELS[slot]}
                value={settings.slots[slot] || "não configurado"}
              />
            ))}
            <Row label="Google Analytics" value={settings.gaMeasurementId || "não configurado"} />
            <Row label="ads.txt" value="/ads.txt" />
            <Row label="Sitemap" value="/sitemap.xml" />
          </div>
        </section>

        <p className="mt-6 text-sm text-muted-foreground">
          Voltar para o <Link to="/" className="underline">início</Link>.
        </p>
      </div>
    </SiteLayout>
  );
}
