import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Edit2,
  KeyRound,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Calendar,
  Trash2,
  MessageSquare,
  Heart,
  Plus,
  BookOpen,
  Loader2,
  Camera,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { FontSizeControls } from "@/components/ChapterReader";
import { ThemeToggle } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useFavorites, useProgress } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import {
  fetchQuestions,
  deleteQuestion,
  getCategoryMeta,
  formatRelativeDate,
  type Question,
} from "@/lib/community";
import {
  fetchNotificationSettings,
  saveNotificationSettings,
  saveLocalNotificationSettings,
  requestNotificationPermission,
  getNotificationPermission,
  isPushNotificationSupported,
  showDailyVerseNotification,
  DEFAULT_NOTIFICATION_SETTINGS,
  type VerseNotificationSettings,
  type NotificationPeriod,
} from "@/lib/notifications";
import { url } from "@/lib/site";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil — histórico, progresso e configurações | Bíblia Online" },
      {
        name: "description",
        content: "Veja seu histórico de leitura, progresso, favoritos e ajuste suas preferências.",
      },
      { property: "og:title", content: "Meu Perfil — Bíblia Online" },
      { property: "og:description", content: "Histórico, progresso e configurações de leitura." },
      { property: "og:url", content: url("/perfil") },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: url("/perfil") }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, isLoading, signOut, updatePassword, updateProfile } = useAuth();
  const { items } = useFavorites();
  const { history } = useProgress();

  // Estado para notificações
  const [notifSettings, setNotifSettings] = useState<VerseNotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [isSavingNotif, setIsSavingNotif] = useState(false);
  const [isTestingNotif, setIsTestingNotif] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>("default");
  const [hasNotificationSupport, setHasNotificationSupport] = useState(false);

  useEffect(() => {
    setHasNotificationSupport(isPushNotificationSupported());
    setPermissionStatus(getNotificationPermission());
    fetchNotificationSettings(user?.id).then((settings) => {
      setNotifSettings(settings);
    });
  }, [user?.id]);

  const updateNotifField = (updates: Partial<VerseNotificationSettings>) => {
    setNotifSettings((prev) => {
      const next = { ...prev, ...updates };
      // Salva localmente de forma instantânea para sincronizar a checagem no cliente
      saveLocalNotificationSettings(next);
      return next;
    });
  };

  const handleRequestPermission = async () => {
    const status = await requestNotificationPermission();
    setPermissionStatus(status);
    if (status === "granted") {
      toast.success("Notificações ativadas no seu dispositivo com sucesso!");
    } else {
      toast.error("Permissão de notificações não foi concedida pelo navegador.");
    }
  };

  const handleTestNotification = async (period: NotificationPeriod = "evening_verse") => {
    setIsTestingNotif(true);
    try {
      const ok = await showDailyVerseNotification(period, user?.id, { force: true });
      if (ok) {
        toast.success(
          period === "evening_verse"
            ? "Notificação do Versículo da Noite enviada com sucesso! Veja no seu celular."
            : "Notificação de teste enviada com sucesso! Veja no seu celular."
        );
      } else {
        toast.error("Não foi possível exibir a notificação. Verifique se as permissões estão ativadas no seu navegador.");
      }
    } finally {
      setIsTestingNotif(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotif(true);
    const ok = await saveNotificationSettings(notifSettings, user?.id);
    setIsSavingNotif(false);
    if (ok) {
      toast.success("Horários e configurações de notificações salvos com sucesso!");
    } else {
      toast.error("Erro ao salvar configurações de notificações.");
    }
  };

  // Estado para edição do nome do perfil
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Estado para alteração de senha
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleLogout() {
    const { error } = await signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Sessão encerrada com sucesso.");
    }
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim() || nameInput.trim().length < 2) {
      toast.error("O nome deve ter no mínimo 2 caracteres.");
      return;
    }
    setSavingName(true);
    const { error } = await updateProfile({ name: nameInput.trim() });
    setSavingName(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Nome atualizado com sucesso!");
      setIsEditingName(false);
    }
  }

  // Estado para edição do avatar
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarInput, setAvatarInput] = useState("");
  const [savingAvatar, setSavingAvatar] = useState(false);

  // Minhas publicações na comunidade
  const [userPosts, setUserPosts] = useState<Question[]>([]);
  const [loadingUserPosts, setLoadingUserPosts] = useState(false);

  const loadUserPosts = async () => {
    if (!user?.id) return;
    setLoadingUserPosts(true);
    try {
      const data = await fetchQuestions({ currentUserId: user.id });
      setUserPosts(data.filter((q) => q.user_id === user.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserPosts(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadUserPosts();
    }
  }, [user?.id]);

  const handleDeleteUserPost = async (questionId: string) => {
    if (!confirm("Tem certeza de que deseja excluir esta publicação da comunidade?")) return;
    try {
      await deleteQuestion(questionId);
      toast.success("Publicação excluída com sucesso.");
      setUserPosts((prev) => prev.filter((p) => p.id !== questionId));
    } catch {
      toast.error("Erro ao excluir publicação.");
    }
  };

  async function handleSaveAvatar(e: React.FormEvent) {
    e.preventDefault();
    setSavingAvatar(true);
    const { error } = await updateProfile({ avatar_url: avatarInput.trim() || null });
    setSavingAvatar(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Foto de perfil atualizada com sucesso!");
      setIsEditingAvatar(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas digitadas não coincidem.");
      return;
    }
    setSavingPassword(true);
    const { error } = await updatePassword(newPassword);
    setSavingPassword(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Senha alterada com sucesso.");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    }
  }

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuário";
  const displayEmail = user?.email || profile?.email || "";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const createdAtFormatted = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Membro recente";

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold">Meu Perfil</h1>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          {isAuthenticated
            ? "Gerencie seus dados de conta, preferências de leitura e sincronização de favoritos e histórico."
            : "Seus dados ficam salvos temporariamente neste navegador. Crie uma conta ou faça login para sincronizá-los com a nuvem."}
        </p>

        {/* SEÇÃO DA CONTA */}
        <section className="surface mt-6 p-5 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <UserIcon className="size-5 text-gold" /> Conta
            </h2>
            {isAuthenticated && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <ShieldCheck className="size-3.5" /> Autenticado
              </span>
            )}
          </div>

          {isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Carregando dados da conta…</p>
          ) : isAuthenticated ? (
            <div className="mt-4 space-y-4">
              {/* Avatar + Nome + Data de Criação */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-border/60">
                <div className="relative group">
                  <div className="size-16 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-2xl overflow-hidden border-2 border-primary/20 shadow-sm">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="size-full object-cover" />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarInput(avatarUrl || "");
                      setIsEditingAvatar(true);
                    }}
                    className="absolute -bottom-1 -right-1 size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:scale-105 transition-transform text-xs"
                    title="Alterar foto"
                  >
                    <Camera className="size-3.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground truncate">{displayName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(displayName);
                        setIsEditingName(true);
                      }}
                      className="text-muted-foreground hover:text-foreground text-xs p-1"
                      title="Editar nome"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5 text-primary" />
                    <span>Membro desde {createdAtFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Modal / Formulário de Edição de Nome */}
              {isEditingName && (
                <form onSubmit={handleSaveName} className="rounded-lg bg-accent/30 p-3 border border-border flex items-center gap-2 flex-wrap">
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Seu nome"
                    className="h-9 max-w-xs text-sm"
                    autoFocus
                  />
                  <Button type="submit" size="sm" disabled={savingName}>
                    <Check className="size-3.5 mr-1" /> Salvar Nome
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingName(false)}
                  >
                    Cancelar
                  </Button>
                </form>
              )}

              {/* Modal / Formulário de Edição de Foto */}
              {isEditingAvatar && (
                <form onSubmit={handleSaveAvatar} className="rounded-lg bg-accent/30 p-3 border border-border space-y-2">
                  <label className="text-xs font-semibold text-foreground block">
                    URL da Foto de Perfil
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      value={avatarInput}
                      onChange={(e) => setAvatarInput(e.target.value)}
                      placeholder="https://exemplo.com/minha-foto.jpg"
                      className="h-9 text-xs flex-1 min-w-[200px]"
                    />
                    <Button type="submit" size="sm" disabled={savingAvatar}>
                      <Check className="size-3.5 mr-1" /> Salvar Foto
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingAvatar(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Insira o link direto de uma imagem para ser exibida no seu perfil. Deixe em branco para usar a inicial.
                  </p>
                </form>
              )}

              {/* Informação de E-mail (Privado) */}
              <div className="rounded-lg bg-card border border-border/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    E-mail da Conta
                  </span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{displayEmail}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground font-medium">
                  🔒 Privado (nunca compartilhado publicamente)
                </span>
              </div>

              {/* Botões de Ação de Conta */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  <KeyRound className="mr-1.5 size-3.5" />
                  {showPasswordForm ? "Fechar redefinição de senha" : "Alterar senha"}
                </Button>
                <Button variant="destructive" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-1.5 size-3.5" /> Sair da conta
                </Button>
              </div>

              {/* Formulário de Alteração de Senha */}
              {showPasswordForm && (
                <form
                  onSubmit={handleChangePassword}
                  className="mt-4 rounded-lg bg-background/50 p-4 border border-border space-y-3 max-w-md"
                >
                  <h3 className="text-sm font-semibold">Alterar Senha</h3>
                  <div className="space-y-1">
                    <Label htmlFor="new-pw" className="text-xs">
                      Nova senha (mínimo 6 caracteres)
                    </Label>
                    <Input
                      id="new-pw"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="conf-pw" className="text-xs">
                      Confirmar nova senha
                    </Label>
                    <Input
                      id="conf-pw"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button type="submit" size="sm" disabled={savingPassword}>
                      {savingPassword ? "Salvando…" : "Atualizar senha"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Faça login ou crie sua conta para sincronizar automaticamente seus versículos favoritos, histórico de leitura e preferências em todos os seus aparelhos.
              </p>
              <div className="mt-4 flex gap-2.5">
                <Button asChild>
                  <Link to="/auth" search={{ mode: "signin", next: "/perfil" }}>
                    Entrar
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/auth" search={{ mode: "signup", next: "/perfil" }}>
                    Criar conta
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* SEÇÃO DE NOTIFICAÇÕES DO VERSÍCULO DO DIA */}
        <section className="surface mt-5 p-5 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Bell className="size-5 text-gold" /> Notificações
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">Versículo do Dia</span>
              <Switch
                checked={notifSettings.verse_notifications_enabled}
                onCheckedChange={(checked) =>
                  setNotifSettings((prev) => ({ ...prev, verse_notifications_enabled: checked }))
                }
              />
            </div>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Receba uma palavra inspiradora da Bíblia Sagrada nos momentos mais importantes do seu dia: manhã, tarde e noite.
          </p>

          {/* Permissão do navegador / Push */}
          {hasNotificationSupport && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-accent/40 px-3.5 py-2.5 text-xs border border-border/60">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${permissionStatus === "granted" ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span>
                  {permissionStatus === "granted"
                    ? "Notificações ativadas no seu dispositivo"
                    : "Permissão pendente no navegador/celular"}
                </span>
              </div>
              {permissionStatus !== "granted" && (
                <Button size="sm" variant="outline" onClick={handleRequestPermission} className="h-7 text-xs">
                  Ativar no aparelho
                </Button>
              )}
            </div>
          )}

          {/* Horários configuráveis */}
          <div className={`mt-4 space-y-3.5 transition-opacity ${notifSettings.verse_notifications_enabled ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
            {/* Manhã */}
            <div className="rounded-lg border border-border/70 p-3 bg-card space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="notif-morning"
                    checked={notifSettings.morning_enabled}
                    onCheckedChange={(checked) =>
                      updateNotifField({ morning_enabled: !!checked })
                    }
                  />
                  <label htmlFor="notif-morning" className="cursor-pointer">
                    <span className="block text-sm font-medium text-foreground">🌅 Manhã</span>
                    <span className="block text-[11px] text-muted-foreground">Comece o dia edificado na Palavra</span>
                  </label>
                </div>
                <Input
                  type="time"
                  step="60"
                  value={notifSettings.morning_time}
                  onChange={(e) =>
                    updateNotifField({ morning_time: e.target.value })
                  }
                  className="w-28 text-center text-xs h-8 font-mono"
                />
              </div>
              <div className="flex items-center gap-1.5 pl-6 pt-0.5">
                <span className="text-[10px] text-muted-foreground">Sugestões:</span>
                {["06:00", "07:00", "08:00", "09:00"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateNotifField({ morning_time: t, morning_enabled: true })}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      notifSettings.morning_time === t
                        ? "bg-primary text-primary-foreground border-primary font-medium"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted border-border/60"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Tarde */}
            <div className="rounded-lg border border-border/70 p-3 bg-card space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="notif-afternoon"
                    checked={notifSettings.afternoon_enabled}
                    onCheckedChange={(checked) =>
                      updateNotifField({ afternoon_enabled: !!checked })
                    }
                  />
                  <label htmlFor="notif-afternoon" className="cursor-pointer">
                    <span className="block text-sm font-medium text-foreground">☀️ Tarde</span>
                    <span className="block text-[11px] text-muted-foreground">Renovo espiritual no meio do dia</span>
                  </label>
                </div>
                <Input
                  type="time"
                  step="60"
                  value={notifSettings.afternoon_time}
                  onChange={(e) =>
                    updateNotifField({ afternoon_time: e.target.value })
                  }
                  className="w-28 text-center text-xs h-8 font-mono"
                />
              </div>
              <div className="flex items-center gap-1.5 pl-6 pt-0.5">
                <span className="text-[10px] text-muted-foreground">Sugestões:</span>
                {["12:00", "13:00", "14:00", "15:00"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateNotifField({ afternoon_time: t, afternoon_enabled: true })}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      notifSettings.afternoon_time === t
                        ? "bg-primary text-primary-foreground border-primary font-medium"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted border-border/60"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Noite */}
            <div className="rounded-lg border border-border/70 p-3 bg-card space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="notif-evening"
                    checked={notifSettings.evening_enabled}
                    onCheckedChange={(checked) =>
                      updateNotifField({ evening_enabled: !!checked })
                    }
                  />
                  <label htmlFor="notif-evening" className="cursor-pointer">
                    <span className="block text-sm font-medium text-foreground">🌙 Noite</span>
                    <span className="block text-[11px] text-muted-foreground">Paz e descanso no Senhor antes de dormir</span>
                  </label>
                </div>
                <Input
                  type="time"
                  step="60"
                  value={notifSettings.evening_time}
                  onChange={(e) =>
                    updateNotifField({ evening_time: e.target.value })
                  }
                  className="w-28 text-center text-xs h-8 font-mono"
                />
              </div>
              <div className="flex items-center gap-1.5 pl-6 pt-0.5">
                <span className="text-[10px] text-muted-foreground">Sugestões:</span>
                {["19:00", "20:00", "21:00", "22:00"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateNotifField({ evening_time: t, evening_enabled: true })}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      notifSettings.evening_time === t
                        ? "bg-primary text-primary-foreground border-primary font-medium"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted border-border/60"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
            <span className="text-xs text-muted-foreground">
              Fuso horário: <strong className="text-foreground">{notifSettings.timezone}</strong>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestNotification("evening_verse")}
                disabled={isTestingNotif}
                className="gap-1.5 text-xs h-9 border-border/80"
              >
                <span>🌙</span>
                {isTestingNotif ? "Enviando…" : "Testar Versículo da Noite"}
              </Button>
              <Button
                onClick={handleSaveNotifications}
                disabled={isSavingNotif}
                size="sm"
                className="gap-1.5 font-semibold text-xs h-9"
              >
                <Check className="size-3.5" />
                {isSavingNotif ? "Salvando…" : "Salvar configurações"}
              </Button>
            </div>
          </div>
        </section>

        {/* SEÇÃO DE CONFIGURAÇÕES */}
        <section className="surface mt-5 p-5 rounded-xl border border-border">
          <h2 className="font-display text-xl font-semibold">Configurações de Leitura</h2>
          <div className="mt-4 flex items-center justify-between border-b border-border/50 pb-3">
            <span className="text-sm font-medium">Tema claro/escuro</span>
            <ThemeToggle />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-b border-border/50 pb-3">
            <span className="text-sm font-medium">Tamanho da fonte</span>
            <FontSizeControls />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium">Tradução bíblica</span>
            <span className="text-sm text-muted-foreground font-serif">Edição Almeida Revista e Corrigida</span>
          </div>
        </section>

        {/* SEÇÃO DE PROGRESSO E HISTÓRICO DE LEITURA */}
        <section className="surface mt-5 p-5 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Histórico & Progresso de Leitura</h2>
            <span className="text-xs text-muted-foreground">
              {history.length} capítulo(s) registrado(s)
            </span>
          </div>

          {history.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhum capítulo lido ainda. Ao navegar pelos livros bíblicos, seu progresso será salvo automaticamente.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border/60 text-sm">
              {history.slice(0, 10).map((h) => (
                <li key={`${h.bookSlug}-${h.chapter}-${h.at}`} className="py-2.5 flex items-center justify-between">
                  <Link
                    to="/biblia/$book/$chapter"
                    params={{ book: h.bookSlug, chapter: String(h.chapter) }}
                    className="font-medium text-foreground hover:text-gold transition-colors"
                  >
                    {h.bookName} {h.chapter}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {new Date(h.at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* SEÇÃO DA COMUNIDADE PALAVRA VIVA — MINHAS PUBLICAÇÕES */}
        {isAuthenticated && (
          <section className="surface mt-5 p-5 rounded-xl border border-border">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <span>📖</span> Minhas Publicações na Comunidade
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Seus pedidos de oração, reflexões, versículos e testemunhos compartilhados.
                </p>
              </div>
              <Button asChild size="sm" className="gap-1.5 text-xs font-semibold">
                <Link to="/comunidade">
                  <Plus className="size-3.5" /> Nova Publicação
                </Link>
              </Button>
            </div>

            {loadingUserPosts ? (
              <div className="py-8 text-center text-muted-foreground">
                <Loader2 className="mx-auto size-5 animate-spin text-primary mb-2" />
                <p className="text-xs">Carregando suas publicações...</p>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-border/80 p-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Você ainda não compartilhou publicações na comunidade.
                </p>
                <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Link to="/comunidade">
                    <Plus className="size-3.5" /> Compartilhar com os irmãos
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {userPosts.map((post) => {
                  const meta = getCategoryMeta(post.category_id);
                  return (
                    <div
                      key={post.id}
                      className="rounded-lg border border-border bg-card p-4 text-xs space-y-2 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-foreground">
                          <span>{meta.emoji}</span>
                          <span>{meta.name}</span>
                        </span>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>{formatRelativeDate(post.created_at)}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteUserPost(post.id)}
                            className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                            title="Excluir publicação"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      <Link
                        to="/comunidade/$id"
                        params={{ id: post.id }}
                        className="block group"
                      >
                        {post.title && (
                          <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                            {post.title}
                          </h3>
                        )}
                        <p className="text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                          {post.body}
                        </p>
                      </Link>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-muted-foreground text-[11px]">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="size-3 text-red-500" />
                            <span>{post.likes_count} curtida(s)</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="size-3 text-primary" />
                            <span>{post.answers_count} comentário(s)</span>
                          </span>
                          {(post.prayed_count || 0) > 0 && (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                              <span>🙏 {post.prayed_count} oraram</span>
                            </span>
                          )}
                        </div>

                        <Link
                          to="/comunidade/$id"
                          params={{ id: post.id }}
                          className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                        >
                          Ver <ExternalLink className="size-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* SEÇÃO DE FAVORITOS */}
        <section className="surface mt-5 p-5 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Meus Favoritos</h2>
            <span className="text-xs text-muted-foreground font-medium">
              {items.length} item(ns) salvo(s)
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {items.length > 0
              ? `Você possui ${items.length} passagem(ns) ou conteúdo(s) marcados com coração.`
              : "Nenhum versículo favoritado ainda. Toque no ícone de coração durante a leitura para salvar passagens especiais."}
          </p>
          <div className="mt-3 flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/favoritos">Ver favoritos</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/biblia">Continuar lendo a Bíblia</Link>
            </Button>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
