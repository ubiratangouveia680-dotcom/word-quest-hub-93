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
import { INITIAL_MATERIALS } from "@/lib/studies-seed";
import { BIBLE_BOOKS } from "@/lib/bible-books";
import { useGlobalOnlinePresence } from "@/lib/presence";
import {
  fetchCommunityReports,
  resolveCommunityReport,
  adminDeleteQuestion,
  adminDeleteAnswer,
  formatRelativeDate,
} from "@/lib/community";
import { Flag, Trash2, CheckCircle2, ShieldAlert, Loader2, ExternalLink } from "lucide-react";
import { BibleMaterialsAdminSection } from "@/components/admin/BibleMaterialsAdminSection";

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

function CommunityModerationSection() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchCommunityReports();
      setReports(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDismiss = async (reportId: string) => {
    setProcessingId(reportId);
    try {
      await resolveCommunityReport(reportId, "dismissed");
      toast.success("Denúncia descartada.");
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch {
      toast.error("Erro ao descartar denúncia.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteContent = async (report: any) => {
    const isPost = report.target_type === "question";
    if (
      !confirm(
        `Tem certeza de que deseja excluir ${isPost ? "esta publicação" : "este comentário"} denunciado?`
      )
    )
      return;

    setProcessingId(report.id);
    try {
      if (isPost) {
        await adminDeleteQuestion(report.target_id);
      } else {
        await adminDeleteAnswer(report.target_id);
      }
      await resolveCommunityReport(report.id, "resolved");
      toast.success("Conteúdo excluído e denúncia resolvida com sucesso.");
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch {
      toast.error("Erro ao excluir conteúdo denunciado.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="surface mt-5 p-5 rounded-xl border border-border">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-destructive" />
          <h2 className="font-display text-xl font-semibold">Moderação da Comunidade Palavra Viva</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-semibold text-foreground">
          {reports.length} denúncia(s)
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Denúncias enviadas pelos membros para análise da moderação fraterna.
      </p>

      {loading ? (
        <div className="py-8 text-center text-muted-foreground">
          <Loader2 className="mx-auto size-5 animate-spin text-primary mb-2" />
          <p className="text-xs">Carregando denúncias...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground">
          <CheckCircle2 className="mx-auto size-6 text-emerald-500 mb-2" />
          Nenhuma denúncia pendente. A Comunidade Palavra Viva está em paz e edificação mútua.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="rounded-lg border border-border bg-card p-4 text-xs space-y-2"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-destructive flex items-center gap-1">
                  <Flag className="size-3.5" /> Motivo: {rep.reason}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {formatRelativeDate(rep.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                <span>
                  Alvo: <strong>{rep.target_type === "question" ? "Publicação" : "Comentário"}</strong>
                </span>
                <span>•</span>
                <span className="truncate max-w-[180px]">ID: {rep.target_id}</span>
                {rep.target_type === "question" && (
                  <Link
                    to="/comunidade/$id"
                    params={{ id: rep.target_id }}
                    target="_blank"
                    className="text-primary hover:underline inline-flex items-center gap-0.5 ml-auto font-medium"
                  >
                    Ver publicação <ExternalLink className="size-3" />
                  </Link>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={processingId === rep.id}
                  onClick={() => handleDismiss(rep.id)}
                  className="h-8 text-xs"
                >
                  Descartar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={processingId === rep.id}
                  onClick={() => handleDeleteContent(rep)}
                  className="h-8 text-xs gap-1"
                >
                  <Trash2 className="size-3" /> Excluir Conteúdo
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AdminPage() {
  const settings = useAdSettings();
  const [session, setSession] = useState<{ email: string | null; id?: string } | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) =>
      setSession(data.session ? { email: data.session.user.email ?? null, id: data.session.user.id } : null),
    );
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s ? { email: s.user.email ?? null, id: s.user.id } : null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const adminQuery = useQuery({
    queryKey: ["is-admin", session?.email ?? null],
    queryFn: () => getIsAdmin(),
    enabled: Boolean(session),
    retry: false,
  });

  const presence = useGlobalOnlinePresence(session?.id);

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
            <CommunityModerationSection />
            <BibleMaterialsAdminSection />
            <AdsForm />
          </>
        )}

        {/* MONITORAMENTO DE USUÁRIOS ONLINE EM TEMPO REAL */}
        <section className="surface mt-5 p-5 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Usuários online agora</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Tempo Real
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Presença detectada em tempo real via Supabase Realtime Presence com deduplicação de abas e heartbeat de 2 minutos.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-card border border-border/70 p-4 text-center">
              <span className="block text-2xl font-bold text-foreground">{presence.totalOnline}</span>
              <span className="text-xs text-muted-foreground font-medium">Total de usuários online</span>
            </div>
            <div className="rounded-lg bg-card border border-border/70 p-4 text-center">
              <span className="block text-2xl font-bold text-primary">{presence.authenticatedOnline}</span>
              <span className="text-xs text-muted-foreground font-medium">Usuários autenticados</span>
            </div>
            <div className="rounded-lg bg-card border border-border/70 p-4 text-center">
              <span className="block text-2xl font-bold text-gold">{presence.visitorsOnline}</span>
              <span className="text-xs text-muted-foreground font-medium">Visitantes online</span>
            </div>
          </div>
        </section>

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
            <Row label="Estudos Bíblicos" value={String(STUDIES.length + INITIAL_MATERIALS.filter((m) => m.type === "estudo").length)} />
            <Row label="Escola Dominical (EBD)" value={String(INITIAL_MATERIALS.filter((m) => m.type === "escola-dominical").length)} />
            <Row label="Apostilas & Cursos" value={String(INITIAL_MATERIALS.filter((m) => m.type === "apostila").length)} />
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
