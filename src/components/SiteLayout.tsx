import { Link } from "@tanstack/react-router";
import { BookOpen, Heart, Home, Menu, Moon, Search, Sun, User } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useSettings } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { to: "/biblia", label: "Bíblia" },
  { to: "/versiculo-do-dia", label: "Versículo do Dia" },
  { to: "/estudos", label: "Estudos" },
  { to: "/devocionais", label: "Devocionais" },
  { to: "/oracoes", label: "Orações" },
  { to: "/pergunte", label: "Pergunte à Bíblia" },
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
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" aria-label="Pesquisar">
              <Link to="/busca">
                <Search className="size-4" />
              </Link>
            </Button>
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="mt-8 flex flex-col gap-1 px-2">
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-3 text-base hover:bg-accent"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link to="/favoritos" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-base hover:bg-accent">
                    Meus Favoritos
                  </Link>
                  <Link to="/perfil" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-base hover:bg-accent">
                    Meu Perfil
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-0">{children}</main>

      <footer className="border-t border-border bg-cream">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-semibold">Bíblia Online</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Leia, compreenda e compartilhe a Palavra. Texto bíblico de domínio público
              (João Ferreira de Almeida).
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Navegar</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/biblia" className="hover:text-foreground">Bíblia</Link></li>
              <li><Link to="/versiculo-do-dia" className="hover:text-foreground">Versículo do Dia</Link></li>
              <li><Link to="/estudos" className="hover:text-foreground">Estudos</Link></li>
              <li><Link to="/devocionais" className="hover:text-foreground">Devocionais</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Recursos</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/oracoes" className="hover:text-foreground">Orações</Link></li>
              <li><Link to="/busca" className="hover:text-foreground">Busca</Link></li>
              <li><Link to="/favoritos" className="hover:text-foreground">Favoritos</Link></li>
              <li><Link to="/pergunte" className="hover:text-foreground">Pergunte à Bíblia</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Institucional</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacidade" className="hover:text-foreground">Política de Privacidade</Link></li>
              <li><Link to="/termos" className="hover:text-foreground">Termos de Uso</Link></li>
              <li><Link to="/cookies" className="hover:text-foreground">Política de Cookies</Link></li>
              <li><Link to="/contato" className="hover:text-foreground">Contato</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Bíblia Online. Todos os direitos reservados.
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
