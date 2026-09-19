import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Edit2, KeyRound, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { FontSizeControls } from "@/components/ChapterReader";
import { ThemeToggle } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFavorites, useProgress } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-medium">Nome</span>
                  {isEditingName ? (
                    <form onSubmit={handleSaveName} className="mt-1.5 flex items-center gap-2">
                      <Input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Seu nome"
                        className="h-9 max-w-xs text-sm"
                        autoFocus
                      />
                      <Button type="submit" size="sm" disabled={savingName}>
                        <Check className="size-3.5 mr-1" /> Salvar
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
                  ) : (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-base font-medium">{displayName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNameInput(displayName);
                          setIsEditingName(true);
                        }}
                        className="text-muted-foreground hover:text-foreground text-xs p-1"
                        aria-label="Editar nome"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-xs text-muted-foreground uppercase font-medium">E-mail</span>
                  <p className="text-sm font-medium mt-0.5 text-foreground">{displayEmail}</p>
                </div>
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
