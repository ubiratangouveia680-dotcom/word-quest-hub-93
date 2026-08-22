import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  ScriptOnce,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Search } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteLayout } from "@/components/SiteLayout";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/CookieConsent";
import { Button } from "@/components/ui/button";

function NotFoundComponent() {
  return (
    <SiteLayout>
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-6xl font-bold text-gold">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold">
          Ops! Não encontramos essa página.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço pode ter mudado ou o conteúdo não existe mais.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild><Link to="/biblia">Voltar para a Bíblia</Link></Button>
          <Button asChild variant="outline"><Link to="/">Ir para a página inicial</Link></Button>
          <Button asChild variant="ghost">
            <Link to="/busca" search={{ q: "" }}><Search className="mr-1 size-4" /> Pesquisar</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado. Tente novamente ou volte para o início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Tentar novamente
          </Button>
          <Button variant="outline" asChild>
            <a href="/">Ir para o início</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Bíblia Online — Leia a Bíblia Sagrada em português" },
      {
        name: "description",
        content:
          "Leia a Bíblia online em português, pesquise versículos, veja o versículo do dia, estudos bíblicos, devocionais e orações.",
      },
      { property: "og:site_name", content: "Bíblia Online" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#fbf9f4" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Bíblia Online",
          slogan: "Leia, compreenda e compartilhe a Palavra.",
          inLanguage: "pt-BR",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const themeScript = `try{var s=JSON.parse(localStorage.getItem('bo:settings')||'{}');if(s.theme==='dark')document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-font',s.fontSize||'base');}catch(e){}`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ScriptOnce>{themeScript}</ScriptOnce>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" />
      <CookieConsent />
    </QueryClientProvider>
  );
}
