import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Compass,
  Heart,
  HeartHandshake,
  History,
  Home,
  Info,
  LogIn,
  LogOut,
  Mail,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  User,
  UserPlus,
  Users,
  Church,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  Smartphone,
  Bookmark,
  FileText,
  Lock,
  ArrowRight,
  Type,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, ThemeToggle } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InstallPwaButton } from "@/components/InstallPwaButton";
import { OnlineCounter } from "@/components/OnlineCounter";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/storage";
import { url } from "@/lib/site";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu Principal — Todas as Seções e Recursos | Bíblia Online" },
      {
        name: "description",
        content:
          "Navegue por todas as seções e recursos da Bíblia Online: Bíblia Sagrada, Pedidos de Oração, Devocionais Diários, Estudos Bíblicos, Comunidade Palavra Viva, Igrejas e Configurações.",
      },
      { property: "og:title", content: "Menu Principal — Bíblia Online" },
      {
        property: "og:description",
        content:
          "Guia completo e navegação de todas as seções, ferramentas bíblicas e áreas da comunidade.",
      },
      { property: "og:url", content: url("/menu") },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: url("/menu") }],
  }),
  component: MenuPage,
});

export function MenuPage() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { settings, update } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.["avatar_url"] || null;
  const userDisplayName =
    profile?.name || user?.user_metadata?.["name"] || user?.email?.split("@")[0] || "Perfil";
  const userHandle = profile?.username || user?.user_metadata?.["username"] || null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/busca", search: { q: searchQuery.trim() } });
    } else {
      navigate({ to: "/busca", search: { q: "" } });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sua sessão foi encerrada com sucesso.");
  };

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-10 space-y-8">
        {/* NAVEGAÇÃO ESTRUTURAL & CABEÇALHO */}
        <div>
          <nav aria-label="Navegação estrutural" className="text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-foreground transition-colors">
              Início
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-foreground font-medium">Menu Principal</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold mb-2 border border-gold/30">
                <BookOpen className="size-3.5" /> Central de Navegação
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                Menu Principal
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                Acesse todas as seções, orações, ferramentas de estudo e recursos da Bíblia Online em um só lugar.
              </p>
            </div>

            {/* Ações Rápidas no Topo */}
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle className="border border-border/80 h-9 px-3 rounded-lg" />
              <InstallPwaButton className="h-9 px-3 text-xs" />
            </div>
          </div>

          {/* BUSCA RÁPIDA NO SITE */}
          <form onSubmit={handleSearchSubmit} className="mt-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar versículos, livros, orações, estudos ou temas..."
              className="pl-10 pr-24 h-12 rounded-xl bg-card border-border shadow-xs text-sm"
              aria-label="Buscar na Bíblia Online"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-3.5 rounded-lg text-xs font-semibold"
            >
              Pesquisar
            </Button>
          </form>
        </div>

        {/* CARD DO USUÁRIO (AUTENTICADO OU VISITANTE) */}
        <section className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-gold/5 p-5 shadow-xs">
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-lg ring-2 ring-gold/40 overflow-hidden shadow-inner">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={userDisplayName}
                        className="size-full object-cover"
                      />
                    ) : (
                      userDisplayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-foreground truncate">
                        {userDisplayName}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Conectado
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {userHandle ? `@${userHandle}` : user?.email}
                    </p>
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                      Favoritos, histórico e pedidos sincronizados na nuvem.
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-9 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-border/80 self-start sm:self-auto"
                >
                  <LogOut className="size-3.5 mr-1.5" /> Sair da conta
                </Button>
              </div>

              {/* Atalhos Rápidos da Conta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border/60">
                <Button asChild variant="outline" size="sm" className="h-9 text-xs justify-start">
                  <Link to="/perfil">
                    <User className="size-3.5 mr-1.5 text-gold" /> Meu Perfil
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="h-9 text-xs justify-start">
                  <Link to="/favoritos">
                    <Heart className="size-3.5 mr-1.5 text-rose-500" /> Favoritos
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="h-9 text-xs justify-start">
                  <Link to="/perfil">
                    <History className="size-3.5 mr-1.5 text-amber-500" /> Histórico
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="h-9 text-xs justify-start">
                  <Link to="/configuracoes">
                    <Settings className="size-3.5 mr-1.5 text-muted-foreground" /> Configurações
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-gold" />
                  <h2 className="text-sm font-bold text-foreground">
                    Sua Área Pessoal na Bíblia Online
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
                  Crie sua conta gratuita ou faça login para salvar versículos favoritos, manter seu histórico de leitura e receber orações da comunidade.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <Button asChild size="sm" className="flex-1 sm:flex-none h-9 px-4 text-xs font-semibold">
                  <Link to="/auth" search={{ mode: "signin", next: "/menu" }}>
                    <LogIn className="size-3.5 mr-1.5" /> Entrar
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none h-9 px-4 text-xs font-semibold">
                  <Link to="/auth" search={{ mode: "signup", next: "/menu" }}>
                    <UserPlus className="size-3.5 mr-1.5" /> Criar Conta
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* 1. SEÇÃO: BÍBLIA SAGRADA */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <BookOpen className="size-5 text-gold" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Bíblia Sagrada
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link
              to="/biblia"
              className="group p-4 rounded-xl border border-border bg-card hover:bg-accent/40 hover:border-gold/50 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-gold/15 text-gold group-hover:scale-105 transition-transform">
                    <BookOpen className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-gold transition-colors">
                      Bíblia Completa
                    </h3>
                    <span className="text-[11px] text-muted-foreground">Todos os 66 Livros</span>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                Leia o Antigo e Novo Testamento na íntegra, capítulo por capítulo em português.
              </p>
            </Link>

            <Link
              to="/versiculo-do-dia"
              className="group p-4 rounded-xl border border-border bg-card hover:bg-accent/40 hover:border-gold/50 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary group-hover:scale-105 transition-transform">
                    <Calendar className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      Versículo do Dia
                    </h3>
                    <span className="text-[11px] text-muted-foreground">Atualizado Hoje</span>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                Palavra diária com explicação teológica, reflexão prática e oração para fortalecer seu dia.
              </p>
            </Link>

            <Link
              to="/biblia/antigo-testamento"
              className="group p-4 rounded-xl border border-border bg-card hover:bg-accent/40 hover:border-gold/50 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                    <FileText className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Antigo Testamento
                    </h3>
                    <span className="text-[11px] text-muted-foreground">39 Livros</span>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                Gênesis a Malaquias: Lei, História, Poesia, Sabedoria e Profecias bíblicas.
              </p>
            </Link>

            <Link
              to="/biblia/novo-testamento"
              className="group p-4 rounded-xl border border-border bg-card hover:bg-accent/40 hover:border-gold/50 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                    <Sparkles className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Novo Testamento
                    </h3>
                    <span className="text-[11px] text-muted-foreground">27 Livros</span>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                Evangelhos, Atos, Cartas Apostólicas e o Apocalipse de Jesus Cristo.
              </p>
            </Link>

            <Link
              to="/versiculos"
              className="group p-4 rounded-xl border border-border bg-card hover:bg-accent/40 hover:border-gold/50 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                    <Heart className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      Versículos por Tema
                    </h3>
                    <span className="text-[11px] text-muted-foreground">+30 Assuntos</span>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                Passagens bíblicas sobre fé, amor, esperança, cura, ansiedade, família e proteção.
              </p>
            </Link>

            <Link
              to="/pergunte-a-biblia"
              className="group p-4 rounded-xl border border-border bg-card hover:bg-accent/40 hover:border-gold/50 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                    <HelpCircle className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Pergunte à Bíblia
                    </h3>
                    <span className="text-[11px] text-muted-foreground">Estudo Interativo</span>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                Tire dúvidas teológicas e encontre respostas contextualizadas com referências fiéis.
              </p>
            </Link>
          </div>
        </section>

        {/* 2. SEÇÃO: ORAÇÕES & ESPIRITUALIDADE */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <HeartHandshake className="size-5 text-rose-500" />
              <h2 className="font-display text-lg font-bold text-foreground">
                Orações & Vida Espiritual
              </h2>
            </div>
            <Link to="/comunidade/pedidos-de-oracao" className="text-xs font-semibold text-gold hover:underline">
              Ver Mural &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              to="/comunidade/pedidos-de-oracao"
              className="group p-4 rounded-xl border-2 border-gold/40 bg-gold/5 hover:bg-gold/10 hover:border-gold transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl leading-none">🙏</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-gold text-primary-foreground px-2 py-0.5 rounded-md">
                    Destaque
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-foreground group-hover:text-gold transition-colors">
                  Mural de Pedidos de Oração
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Publique com seu nome ou anônimo e receba a intercessão da comunidade Palavra Viva.
                </p>
              </div>
              <div className="mt-3 flex items-center text-xs font-semibold text-gold">
                <span>Fazer ou orar por pedido</span>
                <ChevronRight className="size-3.5 ml-1" />
              </div>
            </Link>

            <Link
              to="/oracoes"
              className="group p-4 rounded-xl border border-border bg-card hover:bg-accent/40 hover:border-gold/50 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="flex size-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
                  <HeartHandshake className="size-4" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Orações Bíblicas
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Orações para a manhã, noite, proteção, saúde, portas abertas e família.
                </p>
              </div>
              <div className="mt-3 flex items-center text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                <span>Ver orações</span>
                <ChevronRight className="size-3.5 ml-1" />
              </div>
            </Link>

            <Link
              to="/devocionais"
              className="group p-4 rounded-xl border border-border bg-card hover:bg-accent/40 hover:border-gold/50 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="flex size-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <Sparkles className="size-4" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-foreground group-hover:text-gold transition-colors">
                  Devocionais Diários
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Reflexões curtas e edificantes para começar ou terminar o dia na presença de Deus.
                </p>
              </div>
              <div className="mt-3 flex items-center text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                <span>Ler devocionais</span>
                <ChevronRight className="size-3.5 ml-1" />
              </div>
            </Link>

            <Link
              to="/estudos"
              className="group p-4 rounded-xl border border-border bg-card hover:bg-accent/40 hover:border-gold/50 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Compass className="size-4" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  Estudos Bíblicos
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Conteúdos temáticos com versículos, história e reflexões teológicas práticas.
                </p>
              </div>
              <div className="mt-3 flex items-center text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                <span>Ver estudos</span>
                <ChevronRight className="size-3.5 ml-1" />
              </div>
            </Link>
          </div>
        </section>

        {/* 3. SEÇÃO: COMUNIDADE & CONEXÃO */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Users className="size-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Comunidade & Conexão Cristã
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/comunidade"
              className="group p-4 rounded-xl border border-border bg-card hover:bg-accent/40 hover:border-emerald-500/50 transition-all flex items-start gap-3.5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Users className="size-5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Comunidade Palavra Viva
                  </h3>
                  <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    Ativa
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Fórum para compartilhar testemunhos, tirar dúvidas bíblicas e debater temas da fé em ambiente moderado.
                </p>
              </div>
            </Link>

            <Link
              to="/igrejas"
              className="group p-4 rounded-xl border border-border bg-card hover:bg-accent/40 hover:border-gold/50 transition-all flex items-start gap-3.5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold group-hover:scale-105 transition-transform">
                <Church className="size-5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-gold transition-colors">
                    Igrejas Perto de Você
                  </h3>
                  <span className="text-[10px] font-semibold bg-gold/15 text-gold px-2 py-0.5 rounded-full">
                    Geolocalização
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Descubra igrejas, templos e comunidades cristãs locais pelo mapa interativo ou digitando sua cidade.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* 4. SEÇÃO: PREFERÊNCIAS & AJUSTES DO APP */}
        <section className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Settings className="size-4.5 text-muted-foreground" />
            <h2 className="font-display text-base font-bold text-foreground">
              Preferências & Ajustes do Aplicativo
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Alternar Tema */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-accent/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {mounted && settings.theme === "dark" ? (
                  <Moon className="size-4 text-gold" />
                ) : (
                  <Sun className="size-4 text-amber-500" />
                )}
                <div>
                  <p className="text-xs font-bold text-foreground">Tema da Interface</p>
                  <p className="text-[11px] text-muted-foreground">
                    {mounted && settings.theme === "dark" ? "Modo Escuro Ativo" : "Modo Claro Ativo"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => update({ theme: settings.theme === "dark" ? "light" : "dark" })}
                className="h-8 text-xs font-semibold cursor-pointer"
              >
                Alternar
              </Button>
            </div>

            {/* Notificações Diárias */}
            <Link
              to="/configuracoes"
              className="p-3.5 rounded-xl border border-border/70 bg-accent/20 flex items-center justify-between hover:bg-accent/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="size-4 text-primary" />
                <div>
                  <p className="text-xs font-bold text-foreground">Notificações Diárias</p>
                  <p className="text-[11px] text-muted-foreground">Versículos manhã, tarde e noite</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>

            {/* Instalar App (PWA) */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-accent/20 flex items-center justify-between sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <Smartphone className="size-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-foreground">Instalar Aplicativo</p>
                  <p className="text-[11px] text-muted-foreground">Adicionar à tela inicial</p>
                </div>
              </div>
              <InstallPwaButton className="h-8 text-xs" />
            </div>
          </div>
        </section>

        {/* 5. SEÇÃO: INFORMAÇÕES & SUPORTE */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Info className="size-5 text-muted-foreground" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Sobre o Projeto & Suporte
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <Link
              to="/sobre"
              className="p-3 rounded-xl border border-border/70 bg-card hover:bg-accent/40 transition-colors text-center flex flex-col items-center justify-center gap-1.5"
            >
              <Info className="size-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">Sobre Nós</span>
            </Link>

            <Link
              to="/contato"
              className="p-3 rounded-xl border border-border/70 bg-card hover:bg-accent/40 transition-colors text-center flex flex-col items-center justify-center gap-1.5"
            >
              <Mail className="size-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">Contato</span>
            </Link>

            <Link
              to="/privacidade"
              className="p-3 rounded-xl border border-border/70 bg-card hover:bg-accent/40 transition-colors text-center flex flex-col items-center justify-center gap-1.5"
            >
              <ShieldCheck className="size-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">Privacidade</span>
            </Link>

            <Link
              to="/termos"
              className="p-3 rounded-xl border border-border/70 bg-card hover:bg-accent/40 transition-colors text-center flex flex-col items-center justify-center gap-1.5"
            >
              <FileText className="size-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">Termos</span>
            </Link>

            <Link
              to="/cookies"
              className="p-3 rounded-xl border border-border/70 bg-card hover:bg-accent/40 transition-colors text-center flex flex-col items-center justify-center gap-1.5 col-span-2 sm:col-span-1"
            >
              <Lock className="size-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">Cookies</span>
            </Link>
          </div>
        </section>

        {/* RODAPÉ & CONTADOR */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5 text-center text-xs text-muted-foreground space-y-3">
          <div className="flex justify-center">
            <OnlineCounter showDetails />
          </div>
          <p className="leading-relaxed max-w-md mx-auto">
            © {new Date().getFullYear()} Bíblia Online. Leia, compreenda e compartilhe a Palavra de Deus.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
