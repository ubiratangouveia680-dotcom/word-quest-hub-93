import { Link } from "@tanstack/react-router";
import { BookOpen, Heart, Home, Menu, Moon, Search, Sun, User } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useSettings } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { to: "/biblia", label: "Bíblia" },
  { to: "/versiculo-do-dia", label: "Versículo do Dia" },
  { to: "/versiculos", label: "Versículos" },
  { to: "/estudos", label: "Estudos" },
  { to: "/devocionais", label: "Devocionais" },
  { to: "/oracoes", label: "Orações" },
  { to: "/pergunte-a-biblia", label: "Pergunte à Bíblia" },
] as const;

const BOTTOM = [
  { to: "/", label: "Início", icon: Home },
  { to: "/biblia", label: "Bíblia", icon: BookOpen },
  { to: "/busca", label: "Buscar", icon: Search },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function ThemeToggle() {
  const { settings, update } = useSettings();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && settings.theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      onClick={() => update({ theme: dark ? "light" : "dark" })}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <BookOpen className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold">Bíblia Online</span>
        <span className="hidden text-[11px] text-muted-foreground sm:block">
          Leia, compreenda e compartilhe a Palavra.
        </span>
      </span>
    </Link>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, profile, isAuthenticated } = useAuth();

  const userDisplayName = profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Perfil";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{ className: "text-foreground font-medium" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <Button asChild variant="ghost" size="icon" aria-label="Pesquisar">
              <Link to="/busca" search={{ q: "" }}>
                <Search className="size-4" />
              </Link>
            </Button>
            <ThemeToggle />

            {/* Desktop Auth indicator / button */}
            <div className="hidden lg:flex items-center ml-1">
              {isAuthenticated ? (
                <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 border-border">
                  <Link to="/perfil">
                    <User className="size-3.5 text-gold" />
                    <span className="max-w-[120px] truncate text-xs font-medium">
                      {userDisplayName}
                    </span>
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="h-9 px-3 text-xs font-medium">
                  <Link to="/auth" search={{ mode: "signin" }}>
                    Entrar
                  </Link>
                </Button>
              )}
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 flex flex-col justify-between">
                <div>
                  {/* Mobile user status card */}
                  <div className="mt-6 mb-2 mx-1">
                    {isAuthenticated ? (
                      <div className="rounded-lg bg-accent/40 p-3 border border-border/70 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {userDisplayName}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                        <Link
                          to="/perfil"
                          onClick={() => setOpen(false)}
                          className="text-xs text-gold font-medium shrink-0 hover:underline"
                        >
                          Ver perfil
                        </Link>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button asChild size="sm" className="w-full">
                          <Link
                            to="/auth"
                            search={{ mode: "signin" }}
                            onClick={() => setOpen(false)}
                          >
                            Entrar / Cadastrar
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  <nav className="mt-4 flex flex-col gap-1 px-1">
                    {NAV.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-3 py-2.5 text-base hover:bg-accent"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Link
                      to="/favoritos"
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-base hover:bg-accent flex items-center justify-between"
                    >
                      <span>Meus Favoritos</span>
                      <Heart className="size-4 text-gold" />
                    </Link>
                    <Link
                      to="/perfil"
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-base hover:bg-accent flex items-center justify-between"
                    >
                      <span>Meu Perfil</span>
                      <User className="size-4 text-muted-foreground" />
                    </Link>
                  </nav>
                </div>

                <div className="border-t border-border p-4 text-center text-xs text-muted-foreground">
                  Desenvolvido por <span className="font-medium text-foreground">Ubiratan Gouveia</span>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-cream pb-24 lg:pb-0">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-semibold">Bíblia Online</p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Leia, compreenda e compartilhe a Palavra. Texto bíblico disponibilizado através da Bible API. Plataforma para edificação e estudo das Escrituras.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Navegação Principal</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/biblia" className="hover:text-foreground">Bíblia Online</Link></li>
              <li><Link to="/biblia/antigo-testamento" className="hover:text-foreground">Antigo Testamento</Link></li>
              <li><Link to="/biblia/novo-testamento" className="hover:text-foreground">Novo Testamento</Link></li>
              <li><Link to="/versiculo-do-dia" className="hover:text-foreground">Versículo do Dia</Link></li>
              <li><Link to="/versiculos" className="hover:text-foreground">Versículos por Tema</Link></li>
              <li><Link to="/oracoes" className="hover:text-foreground">Orações</Link></li>
              <li><Link to="/estudos" className="hover:text-foreground">Estudos Bíblicos</Link></li>
              <li><Link to="/devocionais" className="hover:text-foreground">Devocionais</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Ferramentas & Recursos</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/busca" search={{ q: "" }} className="hover:text-foreground">Busca na Bíblia</Link></li>
              <li><Link to="/favoritos" className="hover:text-foreground">Meus Favoritos</Link></li>
              <li><Link to="/pergunte" search={{ q: "" }} className="hover:text-foreground">Pergunte à Bíblia</Link></li>
              <li><Link to="/perfil" className="hover:text-foreground">Meu Histórico</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Institucional & Políticas</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/sobre" className="hover:text-foreground">Sobre Nós</Link></li>
              <li><Link to="/contato" className="hover:text-foreground">Contato</Link></li>
              <li><Link to="/privacidade" className="hover:text-foreground">Política de Privacidade</Link></li>
              <li><Link to="/cookies" className="hover:text-foreground">Política de Cookies</Link></li>
              <li><Link to="/termos" className="hover:text-foreground">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground space-y-1.5 px-4">
          <p>© {new Date().getFullYear()} Bíblia Online. Todos os direitos reservados.</p>
          <p className="text-xs font-medium text-foreground">
            Desenvolvido por <span className="font-semibold text-primary">Ubiratan Gouveia</span>
          </p>
        </div>
      </footer>


      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <ul className="mx-auto flex max-w-lg">
          {BOTTOM.map((item) => (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground"
                activeProps={{ className: "text-primary font-medium" }}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
