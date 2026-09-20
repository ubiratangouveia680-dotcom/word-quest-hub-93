import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
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
  History as HistoryIcon,
  Bookmark,
  Sparkles,
  Lock,
  AtSign,
  HeartHandshake,
  Compass,
  ArrowRight,
  SunMoon,
  Type,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { FontSizeControls } from "@/components/ChapterReader";
import { ThemeToggle } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { useFavorites, useProgress, clearReadingHistory, type FavoriteItem } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import { EditProfileModal } from "@/components/EditProfileModal";
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
import {
  fetchMyPrayerRequests,
  deletePrayerRequest,
  type PrayerRequest,
} from "@/lib/prayer-wall";
import {
  getPrayerNotificationPreferences,
  savePrayerNotificationPreferences,
  type PrayerPushPreferences,
  DEFAULT_PRAYER_PUSH_PREFS,
} from "@/lib/push.functions";
import { url } from "@/lib/site";

export type TabType =
  | "favoritos"
  | "historico"
  | "oracoes"
  | "salvos"
  | "publicacoes"
  | "pedidos_oracao"
  | "configuracoes";

export const Route = createFileRoute("/perfil")({
  validateSearch: (search: Record<string, unknown>): { tab?: TabType } => {
    const validTabs: TabType[] = [
      "favoritos",
      "historico",
      "oracoes",
      "salvos",
      "publicacoes",
      "pedidos_oracao",
      "configuracoes",
    ];
    const tab =
      typeof search.tab === "string" && validTabs.includes(search.tab as TabType)
        ? (search.tab as TabType)
        : undefined;
    return { tab };
  },
  head: () => ({
    meta: [
      { title: "Meu Perfil — Histórico, favoritos e configurações | Bíblia Online" },
      {
        name: "description",
        content: "Gerencie sua conta, favoritos, histórico de leitura da Bíblia e preferências pessoais.",
      },
      { property: "og:title", content: "Meu Perfil — Bíblia Online" },
      { property: "og:description", content: "Sua área pessoal na Bíblia Online." },
      { property: "og:url", content: url("/perfil") },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: url("/perfil") }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    signOut,
    updatePassword,
    deleteAccount,
  } = useAuth();

  const { items, remove: removeFavorite } = useFavorites();
  const { history } = useProgress();

  // Aba ativa inicializada com base na URL
  const [activeTab, setActiveTab] = useState<TabType>(() => search.tab || "favoritos");

  // Sincronizar quando o parâmetro da URL mudar
  useEffect(() => {
    if (search.tab && search.tab !== activeTab) {
      setActiveTab(search.tab);
    }
  }, [search.tab, activeTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    navigate({ search: { tab }, replace: true });
  };

  // Modal de edição do perfil
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Estado para notificações
  const [notifSettings, setNotifSettings] = useState<VerseNotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [isSavingNotif, setIsSavingNotif] = useState(false);
  const [isTestingNotif, setIsTestingNotif] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>("default");
  const [hasNotificationSupport, setHasNotificationSupport] = useState(false);

  // Alteração de senha
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Exclusão de conta
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Minhas publicações na comunidade
  const [userPosts, setUserPosts] = useState<Question[]>([]);
  const [loadingUserPosts, setLoadingUserPosts] = useState(false);

  // Meus pedidos de oração
  const [myPrayers, setMyPrayers] = useState<PrayerRequest[]>([]);
  const [loadingMyPrayers, setLoadingMyPrayers] = useState(false);
  const [prayerToDelete, setPrayerToDelete] = useState<string | null>(null);
  const [isDeletingPrayer, setIsDeletingPrayer] = useState(false);

  // Preferências de Notificação de Oração
  const [prayerPushPrefs, setPrayerPushPrefs] = useState<PrayerPushPreferences>(DEFAULT_PRAYER_PUSH_PREFS);
  const [isSavingPrayerPrefs, setIsSavingPrayerPrefs] = useState(false);

  // Carregar notificações e pedidos do usuário
  useEffect(() => {
    setHasNotificationSupport(isPushNotificationSupported());
    setPermissionStatus(getNotificationPermission());
    if (user?.id) {
      fetchNotificationSettings(user.id).then((settings) => {
        setNotifSettings(settings);
      });
      fetchMyPrayerRequests(user.id).then((list) => {
        setMyPrayers(list);
      });
      getPrayerNotificationPreferences({ data: user.id })
        .then((prefs) => setPrayerPushPrefs(prefs))
        .catch(() => {});
    }
  }, [user?.id]);

  // Carregar pedidos de oração do usuário
  const loadMyPrayers = async () => {
    if (!user?.id) return;
    setLoadingMyPrayers(true);
    try {
      const data = await fetchMyPrayerRequests(user.id);
      setMyPrayers(data);
    } catch (err) {
      console.warn("Erro ao carregar pedidos de oração:", err);
    } finally {
      setLoadingMyPrayers(false);
    }
  };

  // Excluir pedido de oração
  const handleDeletePrayerRequest = async () => {
    if (!prayerToDelete || !user?.id) return;
    try {
      setIsDeletingPrayer(true);
      const ok = await deletePrayerRequest(prayerToDelete, user.id);
      if (ok) {
        toast.success("Pedido de oração excluído com sucesso.");
        setMyPrayers((prev) => prev.filter((p) => p.id !== prayerToDelete));
      } else {
        toast.error("Não foi possível excluir o pedido.");
      }
    } catch {
      toast.error("Erro ao excluir o pedido de oração.");
    } finally {
      setIsDeletingPrayer(false);
      setPrayerToDelete(null);
    }
  };

  // Atualizar preferência individual de push
  const handleTogglePrayerPref = async (key: keyof PrayerPushPreferences) => {
    if (!user?.id) return;
    const next = { ...prayerPushPrefs, [key]: !prayerPushPrefs[key] };
    setPrayerPushPrefs(next);
    setIsSavingPrayerPrefs(true);
    try {
      await savePrayerNotificationPreferences({
        data: { userId: user.id, preferences: next },
      });
      toast.success("Preferências de notificação salvas.");
    } catch {
      toast.error("Erro ao salvar preferências.");
    } finally {
      setIsSavingPrayerPrefs(false);
    }
  };

  // Carregar publicações do usuário na comunidade
  const loadUserPosts = async () => {
    if (!user?.id) return;
    setLoadingUserPosts(true);
    try {
      const data = await fetchQuestions({ currentUserId: user.id });
      setUserPosts(data.filter((q) => q.user_id === user.id));
    } catch (err) {
      console.warn("Erro ao carregar publicações:", err);
    } finally {
      setLoadingUserPosts(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadUserPosts();
    }
  }, [user?.id]);

  // Cálculos reais de estatísticas (sem números fictícios)
  const stats = useMemo(() => {
    const versesCount = items.filter((i) => i.kind === "verse" || !i.kind).length;
    const prayersCount = items.filter((i) => i.kind === "prayer").length;
    const savedContentsCount = items.filter((i) => i.kind === "study" || i.kind === "devotional").length;
    const readingCount = history.length;
    const postsCount = userPosts.length;

    return {
      versesCount,
      readingCount,
      prayersCount,
      savedContentsCount,
      postsCount,
    };
  }, [items, history, userPosts]);

  // Listas filtradas de itens
  const favoriteVerses = useMemo(() => {
    return items.filter((i) => i.kind === "verse" || !i.kind);
  }, [items]);

  const savedPrayers = useMemo(() => {
    return items.filter((i) => i.kind === "prayer");
  }, [items]);

  const savedContents = useMemo(() => {
    return items.filter((i) => i.kind === "study" || i.kind === "devotional");
  }, [items]);

  // Handlers
  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Sessão encerrada com sucesso.");
      navigate({ to: "/" });
    }
  };

  const handleClearHistory = async () => {
    await clearReadingHistory(user?.id);
    toast.success("Histórico de leitura limpo com sucesso.");
  };

  const handleDeleteUserPost = async (questionId: string) => {
    try {
      await deleteQuestion(questionId);
      toast.success("Publicação removida com sucesso.");
      setUserPosts((prev) => prev.filter((p) => p.id !== questionId));
    } catch {
      toast.error("Erro ao remover publicação.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
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
      toast.success("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const { error } = await deleteAccount();
      if (error) {
        toast.error(`Erro ao excluir conta: ${error.message}`);
      } else {
        toast.success("Sua conta e dados foram excluídos com sucesso.");
        navigate({ to: "/" });
      }
    } catch {
      toast.error("Ocorreu uma falha ao tentar excluir a conta.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const updateNotifField = (updates: Partial<VerseNotificationSettings>) => {
    setNotifSettings((prev) => {
      const next = { ...prev, ...updates };
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
        toast.success("Notificação de teste enviada com sucesso! Veja em seu dispositivo.");
      } else {
        toast.error("Não foi possível exibir a notificação. Verifique se as permissões estão ativadas no navegador.");
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
      toast.success("Horários e preferências de notificação salvos com sucesso!");
    } else {
      toast.error("Erro ao salvar configurações de notificação.");
    }
  };

  // Informações de exibição do usuário
  const displayName =
    profile?.name || user?.user_metadata?.["name"] || user?.email?.split("@")[0] || "Membro";
  const displayUsername =
    profile?.username || user?.user_metadata?.["username"] || null;
  const displayEmail = user?.email || profile?.email || "";
  const localAvatar = typeof window !== "undefined" && user?.id ? localStorage.getItem(`bo:user_avatar_${user.id}`) : null;
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.["avatar_url"] || localAvatar || null;

  const createdAtFormatted = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  // ----------------------------------------------------
  // ESTADO: NÃO AUTENTICADO
  // ----------------------------------------------------
  if (!isLoading && !isAuthenticated) {
    return (
      <SiteLayout>
        <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
          <div className="size-16 rounded-full bg-gold/15 text-gold flex items-center justify-center mb-4 border border-gold/30 shadow-sm">
            <Lock className="size-8" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Acesso ao Perfil
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-sm">
            Faça login na sua conta ou crie um cadastro gratuito para acessar seu perfil, sincronizar versículos favoritos, histórico de leitura e participar da comunidade.
          </p>

          <div className="mt-6 flex w-full max-w-xs flex-col gap-2.5">
            <Button asChild className="w-full h-11 text-sm font-semibold bg-primary text-primary-foreground">
              <Link to="/auth" search={{ mode: "signin", next: "/perfil" }}>
                Entrar na minha conta
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-11 text-sm font-semibold">
              <Link to="/auth" search={{ mode: "signup", next: "/perfil" }}>
                Criar cadastro gratuito
              </Link>
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // ----------------------------------------------------
  // ESTADO: CARREGANDO
  // ----------------------------------------------------
  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl items-center justify-center px-4 py-12">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Carregando seu perfil...</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // ----------------------------------------------------
  // ESTADO: AUTENTICADO (PERFIL COMPLETO)
  // ----------------------------------------------------
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-4xl px-3 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* 1. CABEÇALHO DO PERFIL */}
        <section
          aria-label="Informações do Usuário"
          className="surface relative overflow-hidden rounded-2xl border border-border/80 p-5 sm:p-7 shadow-sm transition-all"
        >
          {/* Efeito decorativo sutil de fundo */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 size-48 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 size-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* FOTO CIRCULAR GRANDE (96px) COM BOTÃO DE CÂMERA */}
            <div className="relative shrink-0 group">
              <div className="size-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-bold text-3xl overflow-hidden border-2 border-gold/40 shadow-md">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Botão de câmera para troca rápida de foto */}
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="absolute bottom-0 right-0 size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform border-2 border-background"
                title="Alterar foto de perfil"
                aria-label="Alterar foto de perfil"
              >
                <Camera className="size-4" />
              </button>
            </div>

            {/* DADOS PRINCIPAIS */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground truncate">
                      {displayName}
                    </h1>
                    {displayUsername && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/60 px-2.5 py-0.5 text-xs font-mono font-medium text-foreground/80">
                        <AtSign className="size-3 text-gold" />
                        {displayUsername}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium truncate max-w-[240px]">
                      <Lock className="size-3 text-muted-foreground/80 shrink-0" />
                      {displayEmail}
                    </span>
                    {createdAtFormatted && (
                      <>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-primary shrink-0" />
                          Membro desde {createdAtFormatted}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* BOTÃO PRINCIPAL: EDITAR PERFIL */}
                <div className="shrink-0 flex items-center justify-center gap-2">
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3.5 text-xs font-semibold gap-1.5 border-border hover:border-gold/60 active:scale-95 transition-all shadow-xs"
                  >
                    <Edit2 className="size-3.5 text-gold" />
                    <span>Editar perfil</span>
                  </Button>
                </div>
              </div>

              {/* BIOGRAFIA */}
              <div className="pt-1">
                {displayBio ? (
                  <p className="text-sm text-foreground/90 italic leading-relaxed max-w-2xl bg-accent/20 p-2.5 rounded-lg border border-border/40">
                    "{displayBio}"
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-xs text-primary/80 hover:text-primary hover:underline font-medium flex items-center justify-center sm:justify-start gap-1"
                  >
                    <Plus className="size-3.5" /> Adicionar biografia sobre sua caminhada na fé...
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. CARDS DE ESTATÍSTICAS REAIS */}
        <section aria-label="Estatísticas do Usuário" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="surface rounded-xl border border-border/70 p-3.5 text-center flex flex-col items-center justify-center min-h-[84px] transition-all hover:border-gold/40">
            <span className="flex size-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-1">
              <Heart className="size-4" />
            </span>
            <span className="font-display text-xl sm:text-2xl font-bold text-foreground">
              {stats.versesCount}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Favoritos
            </span>
          </div>

          <div className="surface rounded-xl border border-border/70 p-3.5 text-center flex flex-col items-center justify-center min-h-[84px] transition-all hover:border-gold/40">
            <span className="flex size-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-1">
              <BookOpen className="size-4" />
            </span>
            <span className="font-display text-xl sm:text-2xl font-bold text-foreground">
              {stats.readingCount}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Capítulos Lidos
            </span>
          </div>

          <div className="surface rounded-xl border border-border/70 p-3.5 text-center flex flex-col items-center justify-center min-h-[84px] transition-all hover:border-gold/40">
            <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-1">
              <HeartHandshake className="size-4" />
            </span>
            <span className="font-display text-xl sm:text-2xl font-bold text-foreground">
              {stats.prayersCount}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Orações Salvas
            </span>
          </div>

          <div className="surface rounded-xl border border-border/70 p-3.5 text-center flex flex-col items-center justify-center min-h-[84px] transition-all hover:border-gold/40">
            <span className="flex size-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 mb-1">
              <Bookmark className="size-4" />
            </span>
            <span className="font-display text-xl sm:text-2xl font-bold text-foreground">
              {stats.savedContentsCount}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Conteúdos Salvos
            </span>
          </div>
        </section>

        {/* 3. BARRA DE ABAS DE NAVEGAÇÃO */}
        <section aria-label="Painéis do Perfil" className="space-y-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-border/80">
            <button
              type="button"
              onClick={() => handleTabChange("favoritos")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                activeTab === "favoritos"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Heart className="size-3.5" />
              <span>Favoritos</span>
              <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] font-mono">
                {stats.versesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("historico")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                activeTab === "historico"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <HistoryIcon className="size-3.5" />
              <span>Histórico de Leitura</span>
              <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] font-mono">
                {stats.readingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("oracoes")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                activeTab === "oracoes"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <HeartHandshake className="size-3.5" />
              <span>Minhas Orações</span>
              <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] font-mono">
                {stats.prayersCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("salvos")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                activeTab === "salvos"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Bookmark className="size-3.5" />
              <span>Conteúdos Salvos</span>
              <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] font-mono">
                {stats.savedContentsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("publicacoes")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                activeTab === "publicacoes"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <MessageSquare className="size-3.5" />
              <span>Publicações</span>
              <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] font-mono">
                {stats.postsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("pedidos_oracao")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                activeTab === "pedidos_oracao"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <span>🙏</span>
              <span>Meus Pedidos de Oração</span>
              <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] font-mono">
                {myPrayers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("configuracoes")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                activeTab === "configuracoes"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <KeyRound className="size-3.5" />
              <span>Configurações</span>
            </button>
          </div>

          {/* 4. CONTEÚDO DAS ABAS */}

          {/* ABA 1: MEUS FAVORITOS */}
          {activeTab === "favoritos" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Heart className="size-4 text-rose-500" /> Meus Favoritos
                </h2>
                <span className="text-xs text-muted-foreground">
                  {favoriteVerses.length} {favoriteVerses.length === 1 ? "versículo salvo" : "versículos salvos"}
                </span>
              </div>

              {favoriteVerses.length === 0 ? (
                <div className="surface rounded-2xl border border-dashed border-border/80 p-8 text-center space-y-3">
                  <div className="size-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                    <Heart className="size-6" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">Nenhum favorito ainda</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Comece a salvar seus versículos preferidos tocando no coração ao lado de qualquer versículo durante a leitura.
                  </p>
                  <Button asChild size="sm" className="mt-2">
                    <Link to="/biblia">Explorar a Bíblia</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-2.5">
                  {favoriteVerses.map((item) => (
                    <div
                      key={item.id}
                      className="surface group flex items-start justify-between gap-3 p-4 rounded-xl border border-border/70 hover:border-gold/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <Link
                          to={item.href as any}
                          className="font-bold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <span>{item.title}</span>
                          <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                        </Link>
                        {item.text && (
                          <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2">
                            "{item.text}"
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60">
                          Salvo em {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button asChild variant="ghost" size="sm" className="h-8 px-2.5 text-xs">
                          <Link to={item.href as any}>Ler</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            removeFavorite(item.id);
                            toast.success("Versículo removido dos favoritos.");
                          }}
                          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Remover dos favoritos"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 2: HISTÓRICO DE LEITURA */}
          {activeTab === "historico" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <HistoryIcon className="size-4 text-amber-500" /> Histórico de Leitura
                </h2>
                {history.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-destructive">
                        <RotateCcw className="mr-1 size-3" /> Limpar histórico
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Limpar histórico de leitura?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso removerá o registro dos capítulos acessados recentemente. Seus versículos favoritos não serão afetados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearHistory} className="bg-destructive text-destructive-foreground">
                          Sim, limpar histórico
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              {history.length === 0 ? (
                <div className="surface rounded-2xl border border-dashed border-border/80 p-8 text-center space-y-3">
                  <div className="size-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                    <BookOpen className="size-6" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">Nenhuma leitura registrada</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Seus capítulos lidos recentemente ficarão registrados aqui para você continuar de onde parou.
                  </p>
                  <Button asChild size="sm" className="mt-2">
                    <Link to="/biblia">Começar a ler</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-2.5">
                  {history.map((item, idx) => (
                    <div
                      key={`${item.bookSlug}-${item.chapter}-${idx}`}
                      className="surface flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border/70 hover:border-gold/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                          {item.chapter}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">
                            {item.bookName} {item.chapter}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Acessado em {new Date(item.at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>

                      <Button asChild size="sm" variant="outline" className="h-8 text-xs font-semibold shrink-0">
                        <Link to={`/biblia/${item.bookSlug}/${item.chapter}` as any}>
                          Continuar leitura →
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 3: MINHAS ORAÇÕES */}
          {activeTab === "oracoes" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <HeartHandshake className="size-4 text-emerald-500" /> Minhas Orações Salvas
                </h2>
                <span className="text-xs text-muted-foreground">
                  {savedPrayers.length} {savedPrayers.length === 1 ? "oração salva" : "orações salvas"}
                </span>
              </div>

              {savedPrayers.length === 0 ? (
                <div className="surface rounded-2xl border border-dashed border-border/80 p-8 text-center space-y-3">
                  <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <HeartHandshake className="size-6" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">Nenhuma oração salva ainda</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Você pode salvar orações bíblicas e devocionais para fortalecer seus momentos diários de intimidade com Deus.
                  </p>
                  <Button asChild size="sm" className="mt-2">
                    <Link to="/oracoes">Ver Orações Bíblicas</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-2.5">
                  {savedPrayers.map((item) => (
                    <div
                      key={item.id}
                      className="surface flex items-start justify-between gap-3 p-4 rounded-xl border border-border/70 hover:border-gold/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <Link
                          to={item.href as any}
                          className="font-bold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <span>{item.title}</span>
                          <ExternalLink className="size-3 text-muted-foreground" />
                        </Link>
                        {item.text && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.text}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button asChild variant="ghost" size="sm" className="h-8 px-2.5 text-xs">
                          <Link to={item.href as any}>Abrir</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            removeFavorite(item.id);
                            toast.success("Oração removida dos salvos.");
                          }}
                          className="size-8 text-muted-foreground hover:text-destructive"
                          title="Remover"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 4: CONTEÚDOS SALVOS (DEVOCIONAIS & ESTUDOS) */}
          {activeTab === "salvos" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Bookmark className="size-4 text-blue-500" /> Conteúdos Salvos
                </h2>
                <span className="text-xs text-muted-foreground">
                  {savedContents.length} {savedContents.length === 1 ? "item salvo" : "itens salvos"}
                </span>
              </div>

              {savedContents.length === 0 ? (
                <div className="surface rounded-2xl border border-dashed border-border/80 p-8 text-center space-y-3">
                  <div className="size-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                    <Bookmark className="size-6" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">Nenhum conteúdo salvo ainda</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Salve estudos bíblicos e devocionais diários para aprofundar seu conhecimento quando quiser.
                  </p>
                  <div className="flex justify-center gap-2 pt-1">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/estudos">Estudos Bíblicos</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link to="/devocionais">Devocionais</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2.5">
                  {savedContents.map((item) => (
                    <div
                      key={item.id}
                      className="surface flex items-start justify-between gap-3 p-4 rounded-xl border border-border/70 hover:border-gold/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-accent text-foreground/80">
                            {item.kind === "devotional" ? "Devocional" : "Estudo"}
                          </span>
                          <Link
                            to={item.href as any}
                            className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate"
                          >
                            {item.title}
                          </Link>
                        </div>
                        {item.text && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.text}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button asChild variant="ghost" size="sm" className="h-8 px-2.5 text-xs">
                          <Link to={item.href as any}>Ler</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            removeFavorite(item.id);
                            toast.success("Conteúdo removido.");
                          }}
                          className="size-8 text-muted-foreground hover:text-destructive"
                          title="Remover"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 5: MINHAS PUBLICAÇÕES NA COMUNIDADE */}
          {activeTab === "publicacoes" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="size-4 text-primary" /> Minhas Publicações na Comunidade
                </h2>
                <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                  <Link to="/comunidade">Ir para a Comunidade →</Link>
                </Button>
              </div>

              {loadingUserPosts ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin text-primary" /> Carregando publicações...
                </div>
              ) : userPosts.length === 0 ? (
                <div className="surface rounded-2xl border border-dashed border-border/80 p-8 text-center space-y-3">
                  <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <MessageSquare className="size-6" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">Nenhuma publicação ainda</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Você ainda não compartilhou versículos, reflexões ou pedidos de oração na Comunidade Palavra Viva.
                  </p>
                  <Button asChild size="sm" className="mt-2">
                    <Link to="/comunidade">Compartilhar na Comunidade</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-2.5">
                  {userPosts.map((post) => {
                    const cat = getCategoryMeta(post.category_id);
                    return (
                      <div
                        key={post.id}
                        className="surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/70 hover:border-gold/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{cat.emoji}</span>
                            <span className="text-xs font-semibold text-primary">{cat.name}</span>
                            <span className="text-xs text-muted-foreground/50">•</span>
                            <span className="text-[11px] text-muted-foreground">
                              {formatRelativeDate(post.created_at)}
                            </span>
                          </div>
                          <Link
                            to={`/comunidade/${post.id}` as any}
                            className="font-bold text-sm text-foreground hover:text-primary transition-colors block truncate"
                          >
                            {post.title}
                          </Link>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {post.body}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mr-2">
                            <Heart className="size-3 text-rose-500" /> {post.likes_count}
                          </span>
                          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                            <Link to={`/comunidade/${post.id}` as any}>Ver</Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUserPost(post.id)}
                            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Excluir publicação"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ABA 5.5: MEUS PEDIDOS DE ORAÇÃO */}
          {activeTab === "pedidos_oracao" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <span>🙏</span>
                    <span>Meus Pedidos de Oração</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Gerencie seus pedidos publicados na comunidade e acompanhe os irmãos que estão intercedendo por você.
                  </p>
                </div>

                <Button
                  asChild
                  size="sm"
                  className="h-8 text-xs font-semibold gap-1.5 self-start sm:self-auto bg-gold text-primary-foreground hover:bg-gold/90 cursor-pointer"
                >
                  <Link to="/comunidade/pedidos-de-oracao">
                    <Plus className="size-3.5" /> Publicar Novo Pedido
                  </Link>
                </Button>
              </div>

              {loadingMyPrayers ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="surface p-4 rounded-xl border border-border/80 animate-pulse h-24" />
                  ))}
                </div>
              ) : myPrayers.length === 0 ? (
                <div className="surface p-8 sm:p-12 rounded-2xl border border-dashed border-border/80 text-center space-y-3">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gold/15 text-2xl">
                    🙏
                  </div>
                  <h3 className="font-bold text-sm text-foreground">
                    Você ainda não publicou pedidos de oração
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Compartilhe suas súplicas com a comunidade de fé ou interceda pelos pedidos de outros irmãos.
                  </p>
                  <Button asChild size="sm" className="text-xs font-semibold cursor-pointer">
                    <Link to="/comunidade/pedidos-de-oracao">+ Fazer meu primeiro pedido</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myPrayers.map((prayer) => (
                    <div
                      key={prayer.id}
                      className="surface p-4 sm:p-5 rounded-2xl border border-border/80 space-y-3 transition-all hover:border-gold/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {prayer.is_anonymous ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                <Lock className="size-2.5 text-gold" />
                                Publicado como anônimo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                                Publicado com seu nome
                              </span>
                            )}
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="size-3" />
                              {formatRelativeDate(prayer.created_at)}
                            </span>
                          </div>

                          <p className="text-sm text-foreground/95 whitespace-pre-line leading-relaxed pt-1 break-words">
                            {prayer.content}
                          </p>

                          {prayer.verse_reference && (
                            <div className="inline-flex items-center gap-1 rounded bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-gold mt-1">
                              <BookOpen className="size-3" />
                              <span>{prayer.verse_reference}</span>
                            </div>
                          )}
                        </div>

                        {/* Botão Excluir Pedido */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPrayerToDelete(prayer.id)}
                          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                          title="Excluir pedido de oração"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      <hr className="border-border/60" />

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1.5">
                          <span>🙏</span>
                          <span>
                            {prayer.prayed_count === 1
                              ? "1 pessoa está orando"
                              : `${prayer.prayed_count} pessoas estão orando`}
                          </span>
                        </span>

                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Link to="/comunidade/pedidos-de-oracao">
                            Ver no Mural →
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 6: CONFIGURAÇÕES */}
          {activeTab === "configuracoes" && (
            <div className="space-y-6">
              {/* SUB-SEÇÃO 1: DADOS DO PERFIL */}
              <div className="surface p-5 rounded-2xl border border-border/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                      <UserIcon className="size-4 text-gold" /> Informações do Perfil
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Atualize sua foto, nome completo, identificador (@username) e biografia.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    size="sm"
                    className="h-8 text-xs font-semibold gap-1.5"
                  >
                    <Edit2 className="size-3.5" /> Editar
                  </Button>
                </div>
              </div>

              {/* SUB-SEÇÃO 2: ALTERAÇÃO DE SENHA */}
              <div className="surface p-5 rounded-2xl border border-border/80 space-y-4">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                    <KeyRound className="size-4 text-primary" /> Segurança & Senha
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Altere sua senha de acesso periodicamente para manter sua conta protegida.
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-3 max-w-md pt-1">
                  <div className="space-y-1">
                    <Label htmlFor="new-password-input" className="text-xs font-semibold">
                      Nova Senha (mínimo 6 caracteres)
                    </Label>
                    <Input
                      id="new-password-input"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-9 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="confirm-password-input" className="text-xs font-semibold">
                      Confirmar Nova Senha
                    </Label>
                    <Input
                      id="confirm-password-input"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-9 text-sm"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={savingPassword || !newPassword || newPassword !== confirmPassword}
                    className="h-9 text-xs font-semibold gap-1.5"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="size-3 animate-spin" /> Atualizando...
                      </>
                    ) : (
                      <>
                        <Check className="size-3" /> Salvar nova senha
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* SUB-SEÇÃO 3: NOTIFICAÇÕES DIÁRIAS */}
              <div className="surface p-5 rounded-2xl border border-border/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                      <Bell className="size-4 text-gold" /> Notificações de Versículos
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Receba porções da Palavra de Deus em horários selecionados ao longo do dia.
                    </p>
                  </div>
                  {hasNotificationSupport && permissionStatus !== "granted" && (
                    <Button
                      onClick={handleRequestPermission}
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-semibold gap-1"
                    >
                      <Bell className="size-3 text-gold" /> Ativar no Dispositivo
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3 pt-2">
                  {/* Manhã */}
                  <div className="rounded-xl border border-border/60 bg-accent/20 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">🌅 Manhã</span>
                      <Switch
                        checked={notifSettings.morning_enabled}
                        onCheckedChange={(checked) => updateNotifField({ morning_enabled: checked })}
                      />
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
                  <div className="rounded-xl border border-border/60 bg-accent/20 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">☀️ Tarde</span>
                      <Switch
                        checked={notifSettings.afternoon_enabled}
                        onCheckedChange={(checked) => updateNotifField({ afternoon_enabled: checked })}
                      />
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
                  <div className="rounded-xl border border-border/60 bg-accent/20 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">🌙 Noite</span>
                      <Switch
                        checked={notifSettings.evening_enabled}
                        onCheckedChange={(checked) => updateNotifField({ evening_enabled: checked })}
                      />
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

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                  <Button
                    onClick={handleSaveNotifications}
                    disabled={isSavingNotif}
                    size="sm"
                    className="h-8 text-xs font-semibold gap-1.5"
                  >
                    {isSavingNotif ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Check className="size-3" />
                    )}
                    Salvar horários
                  </Button>
                  <Button
                    onClick={() => handleTestNotification("evening_verse")}
                    disabled={isTestingNotif}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-medium"
                  >
                    {isTestingNotif ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Sparkles className="size-3 text-gold" />
                    )}
                    Enviar notificação de teste
                  </Button>
                </div>
              </div>

              {/* SUB-SEÇÃO 3.5: NOTIFICAÇÕES DA COMUNIDADE & ORAÇÕES */}
              <div className="surface p-5 rounded-2xl border border-border/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                      <Bell className="size-4 text-gold" /> Notificações do Mural de Oração
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Escolha quais alertas deseja receber em seus navegadores e dispositivos autorizados.
                    </p>
                  </div>
                  {hasNotificationSupport && permissionStatus !== "granted" && (
                    <Button
                      onClick={handleRequestPermission}
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-semibold gap-1"
                    >
                      <Bell className="size-3 text-gold" /> Ativar Push
                    </Button>
                  )}
                </div>

                <div className="space-y-3 pt-1">
                  {/* Novos pedidos de oração */}
                  <div className="rounded-xl border border-border/60 bg-accent/20 p-3.5 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="pref-prayer-requests" className="text-xs font-bold text-foreground cursor-pointer">
                        Novos pedidos de oração
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Receba avisos quando novos pedidos de oração forem publicados por irmãos da comunidade.
                      </p>
                    </div>
                    <Switch
                      id="pref-prayer-requests"
                      checked={prayerPushPrefs.prayer_requests_enabled}
                      onCheckedChange={() => handleTogglePrayerPref("prayer_requests_enabled")}
                      disabled={isSavingPrayerPrefs}
                    />
                  </div>

                  {/* Pessoas orando pelos meus pedidos */}
                  <div className="rounded-xl border border-border/60 bg-accent/20 p-3.5 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="pref-prayer-support" className="text-xs font-bold text-foreground cursor-pointer">
                        Pessoas orando pelos meus pedidos
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Seja notificado sempre que alguém clicar em "Vou orar por você" no seu pedido.
                      </p>
                    </div>
                    <Switch
                      id="pref-prayer-support"
                      checked={prayerPushPrefs.prayer_support_enabled}
                      onCheckedChange={() => handleTogglePrayerPref("prayer_support_enabled")}
                      disabled={isSavingPrayerPrefs}
                    />
                  </div>

                  {/* Avisos da comunidade */}
                  <div className="rounded-xl border border-border/60 bg-accent/20 p-3.5 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="pref-community" className="text-xs font-bold text-foreground cursor-pointer">
                        Avisos da comunidade
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Receba mensagens importantes, respostas e comunicados fraternos da comunidade Palavra Viva.
                      </p>
                    </div>
                    <Switch
                      id="pref-community"
                      checked={prayerPushPrefs.community_enabled}
                      onCheckedChange={() => handleTogglePrayerPref("community_enabled")}
                      disabled={isSavingPrayerPrefs}
                    />
                  </div>
                </div>
              </div>

              {/* SUB-SEÇÃO 4: APARÊNCIA & LEITURA */}
              <div className="surface p-5 rounded-2xl border border-border/80 space-y-4">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                    <SunMoon className="size-4 text-primary" /> Aparência & Modo de Leitura
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ajuste o tema visual e tamanho de fonte preferido para suas leituras diárias.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">Tema Visual:</span>
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">Fonte do Leitor:</span>
                    <FontSizeControls />
                  </div>
                </div>
              </div>

              {/* SUB-SEÇÃO 5: PRIVACIDADE & SEGURANÇA */}
              <div className="surface p-5 rounded-2xl border border-border/80 space-y-3">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-500" /> Privacidade & Dados Pessoais (LGPD)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Seus dados pessoais, como e-mail e leituras privadas, são estritamente confidenciais e protegidos por políticas de segurança no banco de dados.
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                  Apenas o seu nome e biografia são públicos na Comunidade Palavra Viva quando você faz uma postagem ou comentário. Suas anotações, favoritos e histórico de leitura são privados de sua conta.
                </p>
              </div>

              {/* SUB-SEÇÃO 6: SESSÃO & ENCERRAMENTO */}
              <div className="surface p-5 rounded-2xl border border-border/80 space-y-4">
                <h3 className="font-display text-base font-bold text-foreground">Sessão da Conta</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs font-semibold gap-1.5"
                  >
                    <LogOut className="size-3.5 text-muted-foreground" /> Sair da conta
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5 mr-1" /> Excluir minha conta definitivamente
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive font-display">
                          <AlertTriangle className="size-5" /> Excluir conta permanentemente?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2 text-xs">
                          <p>
                            Esta ação é irreversível. Todos os seus dados de perfil, favoritos, histórico de leitura e publicações serão excluídos da plataforma.
                          </p>
                          <p className="font-semibold text-foreground">
                            Tem certeza absoluta de que deseja continuar?
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingAccount}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeletingAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeletingAccount ? (
                            <>
                              <Loader2 className="size-3 animate-spin mr-1" /> Excluindo...
                            </>
                          ) : (
                            "Sim, excluir minha conta"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* MODAL DE EDIÇÃO DE PERFIL */}
      <EditProfileModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        profile={profile}
      />

      {/* DIÁLOGO DE CONFIRMAÇÃO PARA EXCLUIR PEDIDO DE ORAÇÃO */}
      <AlertDialog
        open={Boolean(prayerToDelete)}
        onOpenChange={(open) => !open && setPrayerToDelete(null)}
      >
        <AlertDialogContent className="rounded-2xl max-w-md p-5 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Tem certeza que deseja excluir este pedido de oração?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Esta ação removerá o pedido do mural da comunidade e do seu histórico permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel disabled={isDeletingPrayer} className="text-xs">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePrayerRequest}
              disabled={isDeletingPrayer}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold"
            >
              {isDeletingPrayer ? "Excluindo..." : "Sim, excluir pedido"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SiteLayout>
  );
}
