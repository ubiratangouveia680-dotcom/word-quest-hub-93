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
import { getAdSettings } from "@/lib/ads.functions";
import { AdSettingsProvider } from "@/lib/ads-context";
import { defaultAdSettings } from "@/lib/ads-config";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { SITE_URL } from "@/lib/site";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { registerServiceWorker, checkAndDispatchDailyVerses } from "@/lib/notifications";

function NotFoundComponent() {
  return (
    <SiteLayout>
      <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
        <p className="font-display text-7xl font-bold text-gold">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
          Página não encontrada
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          O conteúdo que você procura não foi encontrado ou foi movido para outro endereço.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="default">
            <Link to="/">Voltar para o início</Link>
          </Button>
          <Button asChild variant="outline" size="default">
            <Link to="/busca" search={{ q: "" }}>
              <Search className="mr-1.5 size-4" /> Pesquisar na Bíblia
            </Link>
          </Button>
          <Button asChild variant="outline" size="default">
            <Link to="/biblia">Bíblia</Link>
          </Button>
        </div>

        <div className="mt-8 w-full max-w-md rounded-xl border border-border/70 bg-card/60 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Outras seções populares
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/versiculo-do-dia">Versículo do Dia</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/oracoes">Orações</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/estudos">Estudos Bíblicos</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/devocionais">Devocionais</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/comunidade">Comunidade</Link>
            </Button>
          </div>
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
  loader: async () => {
    try {
      return { adSettings: await getAdSettings() };
    } catch {
      return { adSettings: defaultAdSettings };
    }
  },
  head: ({ loaderData }) => {
    const scripts: Array<{
      type?: string;
      children?: string;
      async?: boolean;
      crossOrigin?: "anonymous" | "use-credentials" | "";
      src?: string;
    }> = [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Bíblia Online",
          url: SITE_URL,
          slogan: "Leia, compreenda e compartilhe a Palavra de Deus.",
          inLanguage: "pt-BR",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE_URL}/busca?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ];

    if (loaderData?.adSettings.gaMeasurementId) {
      const gaId = loaderData.adSettings.gaMeasurementId;
      scripts.push(
        {
          async: true,
          src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`,
        },
        {
          children: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaId}');`,
        },
      );
    }

    if (loaderData?.adSettings.enabled && loaderData.adSettings.publisherId) {
      scripts.push({
        async: true,
        crossOrigin: "anonymous",
        src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${loaderData.adSettings.publisherId}`,
      });
    }

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
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
      ...(import.meta.env["VITE_GOOGLE_SITE_VERIFICATION"]
        ? [{ name: "google-site-verification", content: import.meta.env["VITE_GOOGLE_SITE_VERIFICATION"] }]
          : []),
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
      scripts,
    };
  },
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

function RootContent() {
  const { user } = useAuth();

  useEffect(() => {
    try {
      registerServiceWorker().catch(() => {});
      checkAndDispatchDailyVerses(user?.id);
    } catch (e) {
      console.warn("Notifications init warning:", e);
    }

    const interval = setInterval(() => {
      try {
        checkAndDispatchDailyVerses(user?.id);
      } catch {}
    }, 30 * 1000);

    const handleActive = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        try {
          checkAndDispatchDailyVerses(user?.id);
        } catch {}
      }
    };

    const handleSettingsChanged = () => {
      try {
        checkAndDispatchDailyVerses(user?.id);
      } catch {}
    };

    document.addEventListener("visibilitychange", handleActive);
    window.addEventListener("focus", handleActive);
    window.addEventListener("bo:notification_settings", handleSettingsChanged);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleActive);
      window.removeEventListener("focus", handleActive);
      window.removeEventListener("bo:notification_settings", handleSettingsChanged);
    };
  }, [user?.id]);

  return (
    <>
      <Outlet />
      <NotificationPermissionBanner />
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { adSettings } = Route.useLoaderData();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdSettingsProvider value={adSettings}>
          <RootContent />
        </AdSettingsProvider>
        <Toaster position="top-center" />
        <CookieConsent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
