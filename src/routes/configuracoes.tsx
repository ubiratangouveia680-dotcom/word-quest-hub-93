import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Settings,
  Bell,
  HeartHandshake,
  User,
  Shield,
  Palette,
  Check,
  AlertTriangle,
  LogOut,
  Trash2,
  Lock,
  ExternalLink,
  ChevronRight,
  SunMoon,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { ThemeToggle } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import {
  fetchNotificationSettings,
  saveNotificationSettings,
  saveLocalNotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  type VerseNotificationSettings,
} from "@/lib/notifications";
import {
  subscribeToPrayerPush,
  unsubscribeFromPrayerPush,
  subscribeToVersePush,
  unsubscribeFromVersePush,
  testPrayerPush,
  testDailyVersePush,
  checkDeviceNotificationStatus,
  getStoredPrayerPushState,
  getStoredVersePushState,
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from "@/lib/push-client";
import { url } from "@/lib/site";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Bíblia Online" },
      {
        name: "description",
        content: "Gerencie suas preferências de notificações diárias, aparência, privacidade e conta na Bíblia Online.",
      },
      { property: "og:title", content: "Configurações — Bíblia Online" },
      { property: "og:description", content: "Gerencie notificações, privacidade e preferências." },
      { property: "og:url", content: url("/configuracoes") },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: url("/configuracoes") }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, signOut, deleteAccount } = useAuth();

  // Notificações de Versículo do Dia (Push Nativo)
  const [notifSettings, setNotifSettings] = useState<VerseNotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [versePushEnabled, setVersePushEnabled] = useState<boolean>(() => getStoredVersePushState());
  const [isSavingNotif, setIsSavingNotif] = useState(false);
  const [isTestingVerseNotif, setIsTestingVerseNotif] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>("default");
  const [hasNotificationSupport, setHasNotificationSupport] = useState(false);

  // Notificações de Pedidos de Oração (Push Nativo)
  const [prayerPushEnabled, setPrayerPushEnabled] = useState<boolean>(() => getStoredPrayerPushState());
  const [isSubscribingPrayerPush, setIsSubscribingPrayerPush] = useState(false);
  const [isTestingPrayerPush, setIsTestingPrayerPush] = useState(false);

  // Exclusão de conta
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Preferências de leitura local
  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window === "undefined") return 18;
    const stored = localStorage.getItem("bo:font-size");
    return stored ? parseInt(stored, 10) : 18;
  });

  useEffect(() => {
    setHasNotificationSupport(isPushNotificationSupported());
    setPermissionStatus(getNotificationPermission());

    fetchNotificationSettings(user?.id).then((settings) => {
      setNotifSettings(settings);
    });

    // Consulta e sincroniza status do dispositivo e do usuário (sem flickering no reload)
    checkDeviceNotificationStatus(user?.id).then((status) => {
      setPrayerPushEnabled(status.prayerNotificationsEnabled);
      setVersePushEnabled(status.dailyVerseNotificationsEnabled);
    });
  }, [user?.id]);

  const updateNotifField = (updates: Partial<VerseNotificationSettings>) => {
    setNotifSettings((prev) => {
      const next = { ...prev, ...updates };
      saveLocalNotificationSettings(next);
      return next;
    });
  };

  const handleSaveNotif = async () => {
    setIsSavingNotif(true);
    try {
      await saveNotificationSettings(notifSettings, user?.id);
      toast.success("Horários salvos com sucesso!");
    } catch {
      toast.error("Erro ao salvar horários.");
    } finally {
      setIsSavingNotif(false);
    }
  };

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setPermissionStatus(perm);
    if (perm === "granted") {
      toast.success("Permissão concedida no aparelho!");
      await checkDeviceNotificationStatus(user?.id);
    } else if (perm === "denied") {
      toast.error("Permissão bloqueada. Habilite as notificações nas configurações do seu navegador.");
    }
  };

  // Toggle Push do Versículo do Dia
  const handleToggleVersePush = async (checked: boolean) => {
    try {
      if (checked) {
        const res = await subscribeToVersePush(user?.id);
        const perm = getNotificationPermission();
        setPermissionStatus(perm);

        if (res.success) {
          setVersePushEnabled(true);
          updateNotifField({ verse_notifications_enabled: true });
          toast.success("Notificações do Versículo do Dia ativadas!");
        } else if (perm === "denied") {
          toast.error("Notificações bloqueadas no navegador. Habilite nas permissões do site.");
          setVersePushEnabled(false);
        } else {
          toast.info(res.message || "Permissão não concedida.");
          setVersePushEnabled(false);
        }
      } else {
        await unsubscribeFromVersePush(user?.id);
        setVersePushEnabled(false);
        updateNotifField({ verse_notifications_enabled: false });
        toast.info("Notificações do Versículo do Dia desativadas para este aparelho.");
      }
    } catch {
      toast.error("Erro ao atualizar preferências.");
    }
  };

  // Disparo de teste real de Versículo do Dia via Web Push
  const handleTestDailyVersePush = async () => {
    setIsTestingVerseNotif(true);
    try {
      const res = await testDailyVersePush(user?.id);
      if (res.success) {
        toast.success("Versículo do Dia enviado via Push! Verifique a barra de notificações do seu aparelho.");
      } else {
        toast.error(res.message || "Não foi possível emitir a notificação push de teste.");
      }
    } catch {
      toast.error("Erro ao disparar teste de notificação push.");
    } finally {
      setIsTestingVerseNotif(false);
    }
  };

  // Toggle Push de Pedidos de Oração
  const handleTogglePrayerPush = async (checked: boolean) => {
    setIsSubscribingPrayerPush(true);
    try {
      if (checked) {
        const res = await subscribeToPrayerPush(user?.id);
        const perm = getNotificationPermission();
        setPermissionStatus(perm);

        if (res.success) {
          setPrayerPushEnabled(true);
          toast.success("Notificações de pedidos de oração ativadas com sucesso!");
        } else if (perm === "denied") {
          toast.error("Notificações bloqueadas nas permissões do navegador. Habilite nas configurações do seu navegador.");
          setPrayerPushEnabled(false);
        } else {
          toast.info(res.message || "Permissão não concedida.");
          setPrayerPushEnabled(false);
        }
      } else {
        await unsubscribeFromPrayerPush(user?.id);
        setPrayerPushEnabled(false);
        toast.info("Notificações de pedidos de oração desativadas para este aparelho.");
      }
    } catch {
      toast.error("Erro ao atualizar preferências de notificações push.");
    } finally {
      setIsSubscribingPrayerPush(false);
    }
  };

  const handleTestPrayerPush = async () => {
    setIsTestingPrayerPush(true);
    try {
      const res = await testPrayerPush(user?.id);
      if (res.success) {
        toast.success("Notificação push de teste enviada com sucesso! Verifique sua barra do sistema.");
      } else {
        toast.error(res.message || "Não foi possível emitir a notificação push de teste.");
      }
    } catch {
      toast.error("Erro ao disparar teste de notificação push.");
    } finally {
      setIsTestingPrayerPush(false);
    }
  };

  const handleFontSizeChange = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.max(14, Math.min(26, prev + delta));
      if (typeof window !== "undefined") {
        localStorage.setItem("bo:font-size", next.toString());
      }
      return next;
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const { error } = await deleteAccount();
      if (error) {
        toast.error(`Erro ao excluir conta: ${error.message}`);
      } else {
        toast.success("Sua conta e seus dados foram excluídos com sucesso.");
        navigate({ to: "/" });
      }
    } catch {
      toast.error("Ocorreu uma falha inesperada ao tentar excluir a conta.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Você saiu da sua conta.");
    navigate({ to: "/" });
  };

  return (
    <SiteLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="border-b border-border pb-5">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <Settings className="size-4" />
            <span>Preferências do Sistema</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Configurações
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajuste notificações do versículo do dia, preferências de leitura, privacidade e gerenciamento de conta.
          </p>
        </div>

        {/* 1. SEÇÃO DE NOTIFICAÇÕES DO VERSÍCULO DO DIA */}
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Bell className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Notificações do Versículo do Dia (Push)</h2>
                <p className="text-xs text-muted-foreground">
                  Receba uma palavra inspiradora da Bíblia Sagrada diretamente na barra do seu dispositivo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {versePushEnabled ? "Ativado" : "Desativado"}
              </span>
              <Switch
                checked={versePushEnabled}
                onCheckedChange={handleToggleVersePush}
              />
            </div>
          </div>

          {/* Aviso se permissão do navegador estiver bloqueada */}
          {permissionStatus === "denied" && (
            <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/25 p-3 text-xs text-destructive">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notificações bloqueadas nas configurações do navegador</p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  Para receber o Versículo do Dia no seu aparelho, clique no ícone de cadeado/ajustes ao lado da URL no seu navegador e altere a permissão de "Notificações" para "Permitir".
                </p>
              </div>
            </div>
          )}

          {/* Permissão no navegador */}
          {hasNotificationSupport && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-accent/40 p-3.5 border border-border/60 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`size-2.5 rounded-full ${
                    permissionStatus === "granted" && versePushEnabled ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span>
                  {permissionStatus === "granted"
                    ? versePushEnabled
                      ? "Notificações push prontas e ativas para este aparelho."
                      : "Permissão concedida no navegador; ative o botão acima para receber."
                    : permissionStatus === "denied"
                    ? "Permissão bloqueada no navegador."
                    : "Permissão pendente para receber notificações push no aparelho."}
                </span>
              </div>
              {permissionStatus !== "granted" ? (
                <Button size="sm" variant="outline" onClick={handleRequestPermission} className="h-8 text-xs">
                  Ativar no aparelho
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleTestDailyVersePush}
                  disabled={isTestingVerseNotif}
                  className="h-8 text-xs text-primary font-medium"
                >
                  {isTestingVerseNotif ? "Enviando Versículo Push..." : "Testar Versículo no Meu Aparelho"}
                </Button>
              )}
            </div>
          )}

          {/* Horários */}
          <div
            className={`space-y-3 transition-opacity ${
              notifSettings.verse_notifications_enabled ? "opacity-100" : "opacity-50 pointer-events-none"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Manhã */}
              <div className="rounded-lg border border-border/70 p-3.5 bg-background/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="cfg-notif-morning"
                      checked={notifSettings.morning_enabled}
                      onCheckedChange={(checked) => updateNotifField({ morning_enabled: !!checked })}
                    />
                    <label htmlFor="cfg-notif-morning" className="text-xs font-semibold cursor-pointer">
                      🌅 Manhã
                    </label>
                  </div>
                </div>
                <Input
                  type="time"
                  value={notifSettings.morning_time}
                  onChange={(e) => updateNotifField({ morning_time: e.target.value })}
                  disabled={!notifSettings.morning_enabled}
                  className="h-8 text-xs"
                />
              </div>

              {/* Tarde */}
              <div className="rounded-lg border border-border/70 p-3.5 bg-background/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="cfg-notif-afternoon"
                      checked={notifSettings.afternoon_enabled}
                      onCheckedChange={(checked) => updateNotifField({ afternoon_enabled: !!checked })}
                    />
                    <label htmlFor="cfg-notif-afternoon" className="text-xs font-semibold cursor-pointer">
                      ☀️ Tarde
                    </label>
                  </div>
                </div>
                <Input
                  type="time"
                  value={notifSettings.afternoon_time}
                  onChange={(e) => updateNotifField({ afternoon_time: e.target.value })}
                  disabled={!notifSettings.afternoon_enabled}
                  className="h-8 text-xs"
                />
              </div>

              {/* Noite */}
              <div className="rounded-lg border border-border/70 p-3.5 bg-background/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="cfg-notif-evening"
                      checked={notifSettings.evening_enabled}
                      onCheckedChange={(checked) => updateNotifField({ evening_enabled: !!checked })}
                    />
                    <label htmlFor="cfg-notif-evening" className="text-xs font-semibold cursor-pointer">
                      🌙 Noite
                    </label>
                  </div>
                </div>
                <Input
                  type="time"
                  value={notifSettings.evening_time}
                  onChange={(e) => updateNotifField({ evening_time: e.target.value })}
                  disabled={!notifSettings.evening_enabled}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={handleSaveNotif} disabled={isSavingNotif} className="gap-1.5 text-xs">
                <Check className="size-3.5" />
                {isSavingNotif ? "Salvando..." : "Salvar Horários"}
              </Button>
            </div>
          </div>
        </section>

        {/* 2. SEÇÃO DE NOTIFICAÇÕES DE PEDIDOS DE ORAÇÃO */}
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <HeartHandshake className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Pedidos de Oração (Notificações Push)</h2>
                <p className="text-xs text-muted-foreground">
                  Receba uma notificação no seu aparelho sempre que um irmão publicar um novo pedido de oração para intercessão.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {prayerPushEnabled ? "Ativado" : "Desativado"}
              </span>
              <Switch
                checked={prayerPushEnabled}
                disabled={isSubscribingPrayerPush}
                onCheckedChange={handleTogglePrayerPush}
              />
            </div>
          </div>

          {/* Aviso se permissão do navegador estiver bloqueada */}
          {permissionStatus === "denied" && (
            <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/25 p-3 text-xs text-destructive">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notificações bloqueadas nas configurações do navegador</p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  Para receber avisos de novos pedidos no seu aparelho, clique no ícone de cadeado/ajustes na barra de endereço do navegador e mude a permissão de "Notificações" para "Permitir".
                </p>
              </div>
            </div>
          )}

          {/* Status do Navegador / Aparelho */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-accent/40 p-3.5 border border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${
                  permissionStatus === "granted" && prayerPushEnabled ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <span>
                {!hasNotificationSupport
                  ? "Seu navegador não suporta Notificações Push nativas."
                  : permissionStatus === "granted"
                  ? prayerPushEnabled
                    ? "Notificações push prontas e ativas para este aparelho."
                    : "Permissão concedida no navegador; ative a chave acima para receber."
                  : permissionStatus === "denied"
                  ? "Permissão bloqueada no navegador."
                  : "Permissão necessária no aparelho para receber avisos na barra do sistema."}
              </span>
            </div>
            {hasNotificationSupport && (
              <div className="flex items-center gap-2">
                {permissionStatus !== "granted" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePrayerPush(true)}
                    disabled={isSubscribingPrayerPush}
                    className="h-8 text-xs"
                  >
                    {isSubscribingPrayerPush ? "Ativando..." : "Permitir no Aparelho"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleTestPrayerPush}
                    disabled={isTestingPrayerPush}
                    className="h-8 text-xs text-primary font-medium"
                  >
                    {isTestingPrayerPush ? "Enviando Pedido Push..." : "Testar Pedido no Meu Aparelho"}
                  </Button>
                )}
              </div>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            ℹ️ As notificações push aparecem na barra/central do Android, Windows ou macOS mesmo quando o site estiver fechado. Seus próprios pedidos nunca geram notificações para você.
          </p>
        </section>

        {/* 3. SEÇÃO DE APARÊNCIA E LEITURA */}
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Palette className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Aparência e Leitura</h2>
              <p className="text-xs text-muted-foreground">
                Personalize o tema e o tamanho do texto para uma leitura confortável.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tema */}
            <div className="rounded-lg border border-border/70 p-4 bg-background/50 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground block">Tema da Aplicação</span>
                <span className="text-xs text-muted-foreground">Alternar entre modo claro e escuro</span>
              </div>
              <ThemeToggle />
            </div>

            {/* Tamanho da Fonte */}
            <div className="rounded-lg border border-border/70 p-4 bg-background/50 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground block">Tamanho da Fonte</span>
                <span className="text-xs text-muted-foreground">{fontSize}px (padrão de leitura)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFontSizeChange(-1)}
                  disabled={fontSize <= 14}
                  className="h-8 w-8 p-0 text-sm font-bold"
                >
                  A-
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFontSizeChange(1)}
                  disabled={fontSize >= 26}
                  className="h-8 w-8 p-0 text-sm font-bold"
                >
                  A+
                </Button>
              </div>
            </div>
          </div>

          {/* Amostra visual de leitura */}
          <div className="rounded-lg border border-border/60 bg-accent/20 p-4 text-center">
            <p className="text-muted-foreground italic" style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}>
              “Lâmpada para os meus pés é tua palavra e luz, para o meu caminho.”
            </p>
            <span className="block mt-2 text-xs font-semibold text-primary">— Salmos 119:105</span>
          </div>
        </section>

        {/* 3. SEÇÃO DE PRIVACIDADE E DADOS (LGPD) */}
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Shield className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Privacidade e Proteção de Dados (LGPD)</h2>
              <p className="text-xs text-muted-foreground">
                Respeitamos sua privacidade e garantimos total transparência sobre o uso dos seus dados.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-accent/30 p-4 border border-border/60 text-xs text-muted-foreground space-y-2 leading-relaxed">
            <p className="flex items-start gap-2">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Coleta Mínima de Dados:</strong> Coletamos apenas informações estritamente necessárias para a
                sua experiência (e-mail para login, nome de exibição e preferências salvas). Nunca vendemos ou
                compartilhamos seus dados pessoais com terceiros.
              </span>
            </p>
            <p>
              Seu e-mail permanece estritamente confidencial e nunca é exposto na comunidade, nos comentários ou em
              qualquer área pública do site.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <Button asChild variant="outline" size="sm" className="justify-between text-xs h-9">
              <Link to="/privacidade">
                <span>Política de Privacidade</span>
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="justify-between text-xs h-9">
              <Link to="/cookies">
                <span>Política de Cookies</span>
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="justify-between text-xs h-9">
              <Link to="/termos">
                <span>Termos de Uso</span>
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </Link>
            </Button>
          </div>
        </section>

        {/* 4. SEÇÃO DE CONTA E SEGURANÇA */}
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <User className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Conta e Acesso</h2>
              <p className="text-xs text-muted-foreground">
                Gerencie sua sessão, dados de perfil e segurança de acesso.
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-background/50 border border-border/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    Conectado como
                  </span>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {profile?.name || user?.user_metadata?.["name"] || user?.email?.split("@")[0] || "Usuário"}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <Link to="/perfil">Ver Perfil Completo</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs text-destructive hover:bg-destructive/10">
                    <LogOut className="size-3.5 mr-1" /> Sair
                  </Button>
                </div>
              </div>

              {/* Zona de Perigo — Exclusão de Conta */}
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                  <AlertTriangle className="size-4" />
                  <span>Excluir Conta e Dados Pessoais</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ao excluir sua conta, seus dados de perfil, preferências de leitura, favoritos e histórico
                  sincronizados serão permanentemente removidos. Esta ação é irreversível.
                </p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-1.5 text-xs">
                      <Trash2 className="size-3.5" /> Excluir Minha Conta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="size-5" /> Tem certeza que deseja excluir sua conta?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2 pt-2 text-xs text-muted-foreground leading-relaxed">
                        <p>
                          Esta ação é <strong>permanente e irreversível</strong>. Todos os seus dados pessoais,
                          histórico de leitura sincronizado, preferências de versículo e dados do perfil serão apagados
                          definitivamente.
                        </p>
                        <p>
                          Se tiver certeza absoluta, confirme abaixo para prosseguir com a exclusão da sua conta.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeletingAccount ? "Excluindo..." : "Sim, Excluir Minha Conta"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-accent/20 border border-border/70 p-5 text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                Você está utilizando a Bíblia Online como visitante. Faça login para sincronizar favoritos e receber notificações personalizadas.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Button asChild size="sm">
                  <Link to="/auth" search={{ mode: "signin", next: "/configuracoes" }}>
                    Entrar
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth" search={{ mode: "signup", next: "/configuracoes" }}>
                    Criar Conta
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </SiteLayout>
  );
}
