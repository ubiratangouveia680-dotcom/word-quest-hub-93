import { Link } from "@tanstack/react-router";
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
  Menu,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  User,
  UserPlus,
  Users,
  X,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useSettings } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { OnlineCounter } from "@/components/OnlineCounter";
import { InstallPwaButton } from "@/components/InstallPwaButton";

const DESKTOP_NAV = [
  { to: "/", label: "Início" },
  { to: "/biblia", label: "Bíblia" },
  { to: "/versiculo-do-dia", label: "Versículo do Dia" },
  { to: "/oracoes", label: "Orações" },
  { to: "/estudos", label: "Estudos Bíblicos" },
  { to: "/devocionais", label: "Devocionais" },
  { to: "/comunidade", label: "Comunidade" },
  { to: "/pergunte-a-biblia", label: "Pergunte à Bíblia" },
] as const;

const BOTTOM = [
  { to: "/", label: "Início", icon: Home },
  { to: "/biblia", label: "Bíblia", icon: BookOpen },
  { to: "/comunidade", label: "Comunidade", icon: Users },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { settings, update } = useSettings();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && settings.theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      onClick={() => update({ theme: dark ? "light" : "dark" })}
    >
      {dark ? <Sun className="size-4 text-gold" /> : <Moon className="size-4" />}
    </Button>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex min-h-11 min-w-0 items-center gap-2.5 shrink">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
        <BookOpen className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-bold text-foreground">
          Bíblia Online
        </span>
        <span className="hidden text-[11px] text-muted-foreground xl:block">
          Leia, compreenda e compartilhe a Palavra de Deus.
        </span>
      </span>
    </Link>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { settings, update } = useSettings();

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.["avatar_url"] || null;
  const userDisplayName =
    profile?.name || user?.user_metadata?.["name"] || user?.email?.split("@")[0] || "Perfil";
  const userHandle = profile?.username || user?.user_metadata?.["username"] || null;

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-gold/25 selection:text-foreground">
      {/* CABEÇALHO */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 sm:px-6 lg:flex lg:justify-between">
          {/* 1. Logo */}
          <Logo />

          {/* 2. Menu Desktop */}
          <nav className="hidden items-center gap-0.5 xl:gap-1 lg:flex" aria-label="Navegação Principal">
            {DESKTOP_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-2 py-1.5 text-xs xl:px-2.5 xl:text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground whitespace-nowrap"
                activeProps={{ className: "text-foreground font-semibold bg-accent/60" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 3. Ações no Cabeçalho */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Botão de Pesquisa (visível no desktop e mobile) */}
            <Button asChild variant="ghost" size="icon" className="size-11 shrink-0 sm:size-9" aria-label="Buscar na Bíblia">
              <Link to="/busca" search={{ q: "" }}>
                <Search className="size-4.5" />
              </Link>
            </Button>

            {/* Instalação do PWA (aparece se disponível) */}
            <InstallPwaButton className="hidden md:inline-flex" />

            {/* Alternador de Tema (visível no desktop) */}
            <div className="hidden sm:inline-flex">
              <ThemeToggle />
            </div>

            {/* Acesso ao Usuário Desktop */}
            <div className="hidden lg:flex items-center ml-1">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2 pl-2 pr-2.5 border-border/80 hover:border-gold/50 cursor-pointer"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold font-bold text-xs overflow-hidden border border-gold/30">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={userDisplayName} className="size-full object-cover" />
                        ) : (
                          userDisplayName.charAt(0).toUpperCase()
                        )}
                      </span>
                      <span className="max-w-[110px] truncate text-xs font-semibold">
                        {userDisplayName}
                      </span>
                      <ChevronDown className="size-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-lg border border-border">
                    <div className="px-2 py-2 border-b border-border/60 mb-1">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold font-bold text-xs overflow-hidden border border-gold/30">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={userDisplayName} className="size-full object-cover" />
                          ) : (
                            userDisplayName.charAt(0).toUpperCase()
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-foreground truncate">{userDisplayName}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {userHandle ? `@${userHandle}` : user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuItem asChild className="text-xs cursor-pointer rounded-lg py-2">
                      <Link to="/perfil" className="flex items-center gap-2">
                        <User className="size-3.5 text-gold" />
                        <span>Meu Perfil</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="text-xs cursor-pointer rounded-lg py-2">
                      <Link to="/favoritos" className="flex items-center gap-2">
                        <Heart className="size-3.5 text-rose-500" />
                        <span>Favoritos</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="text-xs cursor-pointer rounded-lg py-2">
                      <Link to="/perfil" className="flex items-center gap-2">
                        <History className="size-3.5 text-amber-500" />
                        <span>Histórico de Leitura</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="text-xs cursor-pointer rounded-lg py-2">
                      <Link to="/perfil" className="flex items-center gap-2">
                        <Settings className="size-3.5 text-muted-foreground" />
                        <span>Configurações</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-xs cursor-pointer rounded-lg py-2 text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2"
                    >
                      <LogOut className="size-3.5" />
                      <span>Sair da conta</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild size="sm" className="h-9 px-3.5 text-xs font-semibold">
                  <Link to="/auth" search={{ mode: "signin" }}>
                    <LogIn className="mr-1.5 size-3.5" /> Entrar
                  </Link>
                </Button>
              )}
            </div>

            {/* 4. Menu Hamburger Mobile (Apenas [Logo] [Pesquisar] [☰] no mobile) */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-11 lg:hidden shrink-0 cursor-pointer text-foreground hover:bg-accent"
                  aria-label="Abrir menu de navegação"
                >
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[88vw] max-w-sm flex flex-col justify-between overflow-y-auto p-0 bg-background border-l border-border shadow-2xl z-[70] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
              >
                <div className="p-5 pb-6 space-y-5">
                  {/* Cabeçalho do Drawer com Logo e Botão Fechar */}
                  <SheetHeader className="text-left border-b border-border/60 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                          <BookOpen className="size-4" />
                        </span>
                        <SheetTitle className="text-base font-bold">Bíblia Online</SheetTitle>
                      </div>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="size-8 rounded-full">
                          <X className="size-4" />
                        </Button>
                      </SheetClose>
                    </div>
                    <SheetDescription className="text-xs text-muted-foreground mt-1">
                      Leia, compreenda e compartilhe a Palavra de Deus.
                    </SheetDescription>
                  </SheetHeader>

                  {/* Card do Usuário (Entrar/Criar conta ou Perfil/Sair) */}
                  <div className="rounded-xl border border-border/80 bg-accent/30 p-3.5">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold font-bold text-sm ring-2 ring-gold/30 overflow-hidden">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={userDisplayName}
                                className="size-full object-cover"
                              />
                            ) : (
                              userDisplayName.charAt(0).toUpperCase()
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate">{userDisplayName}</p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {userHandle ? `@${userHandle}` : user?.email}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-border/50 text-xs">
                          <Button asChild size="sm" variant="outline" className="h-8 text-xs font-medium justify-start">
                            <Link to="/perfil" onClick={() => setOpen(false)}>
                              <User className="mr-1.5 size-3.5 text-gold" /> Perfil
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="h-8 text-xs font-medium justify-start">
                            <Link to="/favoritos" onClick={() => setOpen(false)}>
                              <Heart className="mr-1.5 size-3.5 text-rose-500" /> Favoritos
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="ghost" className="h-8 text-xs font-medium justify-start">
                            <Link to="/perfil" onClick={() => setOpen(false)}>
                              <History className="mr-1.5 size-3.5 text-amber-500" /> Histórico
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSignOut}
                            className="h-8 text-xs font-medium justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <LogOut className="mr-1.5 size-3.5" /> Sair
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Acesse sua conta para salvar favoritos, anotações e progresso diário.
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Button asChild size="sm" className="h-8.5 text-xs font-semibold">
                            <Link to="/auth" search={{ mode: "signin" }} onClick={() => setOpen(false)}>
                              <LogIn className="mr-1 size-3.5" /> Entrar
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="h-8.5 text-xs font-semibold">
                            <Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)}>
                              <UserPlus className="mr-1 size-3.5" /> Criar conta
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* NAVEGAÇÃO ESTRUTURADA EM CATEGORIAS */}
                  <nav className="space-y-4 text-sm" aria-label="Menu Mobile">
                    {/* INÍCIO */}
                    <div>
                      <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        Início
                      </p>
                      <div className="mt-1 space-y-0.5">
                        <Link
                          to="/"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <Home className="size-4 text-primary" />
                          <span>Início</span>
                        </Link>
                      </div>
                    </div>

                    {/* BÍBLIA */}
                    <div>
                      <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        Bíblia
                      </p>
                      <div className="mt-1 space-y-0.5">
                        <Link
                          to="/biblia"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <BookOpen className="size-4 text-gold" />
                          <span>Bíblia Sagrada</span>
                        </Link>
                        <Link
                          to="/versiculo-do-dia"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <Calendar className="size-4 text-primary" />
                          <span>Versículo do Dia</span>
                        </Link>
                        <Link
                          to="/favoritos"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <Heart className="size-4 text-gold" />
                          <span>Favoritos</span>
                        </Link>
                        <Link
                          to="/perfil"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <History className="size-4 text-muted-foreground" />
                          <span>Histórico de Leitura</span>
                        </Link>
                      </div>
                    </div>

                    {/* CONTEÚDO */}
                    <div>
                      <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        Conteúdo
                      </p>
                      <div className="mt-1 space-y-0.5">
                        <Link
                          to="/oracoes"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <HeartHandshake className="size-4 text-rose-500" />
                          <span>Orações Bíblicas</span>
                        </Link>
                        <Link
                          to="/estudos"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <Compass className="size-4 text-primary" />
                          <span>Estudos Bíblicos</span>
                        </Link>
                        <Link
                          to="/devocionais"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <Sparkles className="size-4 text-gold" />
                          <span>Devocionais Diários</span>
                        </Link>
                      </div>
                    </div>

                    {/* COMUNIDADE */}
                    <div>
                      <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        Comunidade
                      </p>
                      <div className="mt-1 space-y-0.5">
                        <Link
                          to="/comunidade"
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <Users className="size-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Comunidade Palavra Viva</span>
                          </span>
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-semibold">
                            Ativa
                          </span>
                        </Link>
                        <Link
                          to="/perfil"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <User className="size-4 text-muted-foreground" />
                          <span>Meu Perfil</span>
                        </Link>
                      </div>
                    </div>

                    {/* FERRAMENTAS */}
                    <div>
                      <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        Ferramentas
                      </p>
                      <div className="mt-1 space-y-0.5">
                        <Link
                          to="/busca"
                          search={{ q: "" }}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <Search className="size-4 text-primary" />
                          <span>Buscar na Bíblia</span>
                        </Link>
                        <Link
                          to="/pergunte-a-biblia"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <HelpCircle className="size-4 text-gold" />
                          <span>Pergunte à Bíblia</span>
                        </Link>
                      </div>
                    </div>

                    {/* OUTROS */}
                    <div>
                      <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        Outros & Preferências
                      </p>
                      <div className="mt-1 space-y-0.5">
                        {/* Controle de Tema no Menu Mobile */}
                        <button
                          type="button"
                          onClick={() => update({ theme: settings.theme === "dark" ? "light" : "dark" })}
                          className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
                        >
                          <span className="flex items-center gap-2.5">
                            {settings.theme === "dark" ? (
                              <Sun className="size-4 text-gold" />
                            ) : (
                              <Moon className="size-4 text-muted-foreground" />
                            )}
                            <span>Tema {settings.theme === "dark" ? "Escuro" : "Claro"}</span>
                          </span>
                          <span className="text-[11px] text-muted-foreground font-semibold capitalize">
                            {settings.theme === "dark" ? "Ativo" : "Padrão"}
                          </span>
                        </button>

                        <Link
                          to="/configuracoes"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <Settings className="size-4 text-muted-foreground" />
                          <span>Configurações</span>
                        </Link>
                        <div className="pt-1">
                          <InstallPwaButton className="w-full justify-start text-left" />
                        </div>
                        <Link
                          to="/sobre"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <Info className="size-4 text-muted-foreground" />
                          <span>Sobre Nós</span>
                        </Link>
                        <Link
                          to="/contato"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <Mail className="size-4 text-muted-foreground" />
                          <span>Contato</span>
                        </Link>
                      </div>
                    </div>
                  </nav>
                </div>

                {/* Rodapé do Menu Mobile */}
                <div className="border-t border-border bg-card/60 p-4 text-center text-xs text-muted-foreground space-y-2.5">
                  <div className="flex justify-center">
                    <OnlineCounter showDetails />
                  </div>
                  <p>
                    © {new Date().getFullYear()} Bíblia Online. Todos os direitos reservados.
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1">{children}</main>

      {/* RODAPÉ DESKTOP & GERAL */}
      <footer className="border-t border-border bg-cream pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <div className="mb-8 max-w-xl">
            <p className="font-display text-xl font-bold text-foreground">Bíblia Online</p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Leia, compreenda e compartilhe a Palavra de Deus. Texto bíblico completo, versículo do dia, orações, estudos teológicos e comunidade cristã para edificação espiritual.
            </p>
          </div>

          <div className="grid gap-8 grid-cols-2 sm:grid-cols-4">
            {/* GRUPO BÍBLIA */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Bíblia</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/biblia" className="hover:text-foreground transition-colors">Bíblia</Link></li>
                <li><Link to="/versiculo-do-dia" className="hover:text-foreground transition-colors">Versículo do Dia</Link></li>
                <li><Link to="/busca" search={{ q: "" }} className="hover:text-foreground transition-colors">Busca</Link></li>
              </ul>
            </div>

            {/* GRUPO CONTEÚDO */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Conteúdo</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/oracoes" className="hover:text-foreground transition-colors">Orações</Link></li>
                <li><Link to="/estudos" className="hover:text-foreground transition-colors">Estudos Bíblicos</Link></li>
                <li><Link to="/devocionais" className="hover:text-foreground transition-colors">Devocionais</Link></li>
              </ul>
            </div>

            {/* GRUPO COMUNIDADE */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Comunidade</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/comunidade" className="hover:text-foreground transition-colors">Comunidade</Link></li>
                <li><Link to="/perfil" className="hover:text-foreground transition-colors">Meu Perfil</Link></li>
              </ul>
            </div>

            {/* GRUPO INFORMAÇÕES */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Informações</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/sobre" className="hover:text-foreground transition-colors">Sobre</Link></li>
                <li><Link to="/contato" className="hover:text-foreground transition-colors">Contato</Link></li>
                <li><Link to="/privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</Link></li>
                <li><Link to="/termos" className="hover:text-foreground transition-colors">Termos de Uso</Link></li>
                <li><Link to="/cookies" className="hover:text-foreground transition-colors">Política de Cookies</Link></li>
                <li><Link to="/configuracoes" className="hover:text-foreground transition-colors">Configurações</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border py-6 text-center text-xs text-muted-foreground space-y-3 px-4 flex flex-col items-center justify-center">
          <OnlineCounter showDetails />
          <div className="space-y-1">
            <p>© {new Date().getFullYear()} Bíblia Online. Todos os direitos reservados.</p>
            <p className="text-xs font-medium text-foreground">
              Desenvolvido por <span className="font-semibold text-primary">Ubiratan Gouveia</span>
            </p>
          </div>
        </div>
      </footer>

      {/* BARRA INFERIOR MOBILE */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden pb-[max(0.35rem,env(safe-area-inset-bottom,0px))] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
        aria-label="Navegação Inferior Mobile"
      >
        <ul className="mx-auto flex max-w-md items-center justify-around px-1">
          {BOTTOM.map((item) => (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="flex flex-col items-center justify-center gap-1 min-h-[56px] py-1.5 text-[11px] font-medium text-muted-foreground transition-all active:scale-95 touch-manipulation relative rounded-lg hover:text-foreground"
                activeProps={{ className: "text-primary font-bold after:absolute after:bottom-1 after:h-0.5 after:w-4 after:rounded-full after:bg-primary" }}
              >
                <item.icon className="size-5 shrink-0" />
                <span className="leading-none tracking-tight">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
