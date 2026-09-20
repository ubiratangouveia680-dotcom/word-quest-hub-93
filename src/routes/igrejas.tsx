import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { ChurchMap } from "@/components/ChurchMap";
import {
  searchNearbyChurchesFn,
  geocodeAddressFn,
  type Church,
} from "@/lib/churches.functions";
import { url } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Church as ChurchIcon,
  Compass,
  HelpCircle,
  Info,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/igrejas")({
  head: () => ({
    meta: [
      { title: "Igrejas perto de você | Bíblia Online" },
      {
        name: "description",
        content:
          "Encontre igrejas próximas à sua localização e descubra comunidades cristãs perto de você.",
      },
      { property: "og:title", content: "Igrejas perto de você | Bíblia Online" },
      {
        property: "og:description",
        content:
          "Encontre igrejas próximas à sua localização e descubra comunidades cristãs perto de você.",
      },
      { property: "og:url", content: url("/igrejas") },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: url("/igrejas") }],
  }),
  component: IgrejasPage,
});

const RADIUS_OPTIONS = [
  { label: "5 km (padrão)", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "25 km", value: 25000 },
  { label: "50 km", value: 50000 },
];

const SUGGESTED_TERMS = [
  "Todas as igrejas",
  "Igreja evangélica",
  "Igreja católica",
  "Igreja batista",
  "Assembleia de Deus",
  "Paróquia",
  "Comunidade cristã",
];

function IgrejasPage() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [locationName, setLocationName] = useState<string>("");
  const [radiusMeters, setRadiusMeters] = useState<number>(5000); // Começa com 5 km
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurchId, setSelectedChurchId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<
    "idle" | "requesting_location" | "loading" | "success" | "empty" | "permission_denied" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  // 1. Geolocalização ao clicar
  const handleGetLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Seu navegador não suporta geolocalização. Por favor, pesquise manualmente por sua cidade.");
      return;
    }

    setStatus("requesting_location");
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setLocationName("Sua localização atual");
        fetchChurches(latitude, longitude, radiusMeters, currentQuery || undefined, true);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("permission_denied");
        } else if (error.code === error.TIMEOUT) {
          setStatus("error");
          setErrorMessage("O tempo de espera para obter sua localização expirou. Tente novamente ou busque manualmente.");
        } else {
          setStatus("error");
          setErrorMessage("Não foi possível acessar sua localização no momento. Você pode pesquisar sua cidade ou bairro abaixo.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      },
    );
  };

  // 2. Busca no servidor (Google Places New + Text Search + Fallback)
  const fetchChurches = async (
    lat: number,
    lng: number,
    radius: number,
    query?: string,
    autoExpand = true,
  ) => {
    setStatus("loading");
    setErrorMessage("");
    startTransition(async () => {
      try {
        const res = await searchNearbyChurchesFn({
          data: {
            latitude: lat,
            longitude: lng,
            radiusMeters: radius,
            query: query && query !== "Todas as igrejas" ? query : undefined,
            autoExpand,
          },
        });

        // Se houve expansão automática no backend (ex: de 5 km para 10 km por ter poucos resultados)
        if (res.expandedAutomatically && res.effectiveRadiusMeters) {
          setRadiusMeters(res.effectiveRadiusMeters);
        }

        if (res.churches && res.churches.length > 0) {
          setChurches(res.churches);
          setSelectedChurchId(res.churches[0]?.id || null);
          setStatus("success");
        } else {
          setChurches([]);
          setSelectedChurchId(null);
          setStatus("empty");
        }
      } catch (err: any) {
        console.error("Erro ao buscar igrejas:", err);
        setStatus("error");
        setErrorMessage(err.message || "Não foi possível carregar as igrejas neste momento. Tente novamente.");
      }
    });
  };

  // 3. Busca manual (por cidade, bairro, endereço ou denominação)
  const handleSearchManual = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setStatus("loading");
    setErrorMessage("");

    // Se o usuário digitou uma expressão como "igrejas evangélicas", "igreja batista" e já temos uma localização
    const isDenominationQuery = /^(igrejas?|templos?|par[oó]quias?|capelas?|comunidades?)/i.test(q);

    if (isDenominationQuery && userLocation && !/(em|no|na|de|perto\s+de)\s+[a-zÀ-ÿ]/i.test(q)) {
      setCurrentQuery(q);
      fetchChurches(userLocation.latitude, userLocation.longitude, radiusMeters, q, false);
      return;
    }

    try {
      const geo = await geocodeAddressFn({ data: { query: q } });
      setUserLocation({ latitude: geo.latitude, longitude: geo.longitude });
      setLocationName(geo.displayName.split(",")[0] || geo.displayName);
      setCurrentQuery(q);
      fetchChurches(geo.latitude, geo.longitude, radiusMeters, q, true);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || `Não encontramos "${q}". Tente digitar cidade e estado (ex: "Campinas, SP").`);
    }
  };

  // 4. Clique em sugestão de denominação
  const handleSelectSuggestedTerm = (term: string) => {
    const q = term === "Todas as igrejas" ? "" : term;
    setCurrentQuery(q);
    setSearchQuery(q);

    if (userLocation) {
      fetchChurches(userLocation.latitude, userLocation.longitude, radiusMeters, q || undefined, false);
    } else {
      handleGetLocation();
    }
  };

  // 5. Alterar raio manualmente
  const handleRadiusChange = (newRadius: number) => {
    setRadiusMeters(newRadius);
    if (userLocation) {
      fetchChurches(userLocation.latitude, userLocation.longitude, newRadius, currentQuery || undefined, false);
    }
  };

  // 6. Botão "Ampliar busca" (5 km → 10 km → 25 km)
  const handleExpandRadius = () => {
    let nextRadius = 10000;
    if (radiusMeters < 10000) nextRadius = 10000;
    else if (radiusMeters < 25000) nextRadius = 25000;
    else nextRadius = 50000;

    setRadiusMeters(nextRadius);
    if (userLocation) {
      fetchChurches(userLocation.latitude, userLocation.longitude, nextRadius, currentQuery || undefined, false);
    }
  };

  return (
    <SiteLayout>
      <main className="mx-auto w-full max-w-6xl px-3 sm:px-6 py-4 sm:py-8 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Navegação" className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">
            Início
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Igrejas perto de você</span>
        </nav>

        {/* Hero do Cabeçalho */}
        <section className="warm-panel rounded-2xl p-5 sm:p-8 relative overflow-hidden">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-semibold">
              <ChurchIcon className="size-3.5" />
              <span>Comunhão e Adoração</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
              Igrejas perto de você
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Encontre igrejas próximas à sua localização. Descubra locais de oração, comunhão bíblica e louvor em sua região.
            </p>
          </div>

          {/* Barra de Ações Rápidas */}
          <div className="mt-6 pt-5 border-t border-border/60 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Botão Principal de Geolocalização */}
            <Button
              type="button"
              size="lg"
              onClick={handleGetLocation}
              disabled={status === "requesting_location" || isPending}
              className="h-11 sm:h-12 px-5 text-sm font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 cursor-pointer shrink-0"
            >
              {status === "requesting_location" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Solicitando localização...
                </>
              ) : (
                <>
                  <LocateFixed className="mr-2 size-4 text-gold" />
                  📍 Encontrar igrejas perto de mim
                </>
              )}
            </Button>

            {/* Formulário de Busca por Endereço */}
            <form onSubmit={handleSearchManual} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ex: Campinas, Itaguaí, Copacabana ou Igreja Batista..."
                  className="h-11 sm:h-12 pl-10 pr-3 text-sm bg-background/90"
                  aria-label="Buscar cidade, bairro ou denominação"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                size="lg"
                disabled={!searchQuery.trim() || status === "loading"}
                className="h-11 sm:h-12 px-4 text-xs sm:text-sm font-medium shrink-0 cursor-pointer"
              >
                Buscar
              </Button>
            </form>
          </div>

          {/* Sugestões de Denominações */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium mr-1 text-[11px]">Termos comuns:</span>
            {SUGGESTED_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleSelectSuggestedTerm(term)}
                className={`rounded-full px-2.5 py-0.5 transition-colors cursor-pointer text-xs ${
                  (currentQuery === term) || (!currentQuery && term === "Todas as igrejas")
                    ? "bg-gold text-primary-foreground font-semibold"
                    : "bg-accent/70 hover:bg-accent hover:text-foreground"
                }`}
              >
                {term}
              </button>
            ))}
          </div>

          {/* Seletor de Raio de Distância */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs pt-3 border-t border-border/50">
            <span className="text-muted-foreground font-medium flex items-center gap-1 mr-1">
              <Compass className="size-3.5" /> Raio de busca:
            </span>
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleRadiusChange(opt.value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  radiusMeters === opt.value
                    ? "bg-gold text-primary-foreground shadow-xs"
                    : "bg-accent/60 text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Notificações e Estados da Interface */}
        {status === "permission_denied" && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 flex items-start gap-3 text-amber-900 dark:text-amber-200">
            <AlertCircle className="size-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold">Não foi possível acessar sua localização.</p>
              <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                Você pode pesquisar uma cidade, bairro ou endereço manualmente digitando no campo de busca acima.
              </p>
            </div>
          </div>
        )}

        {status === "error" && errorMessage && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 sm:p-5 flex items-start gap-3 text-destructive">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm flex-1">
              <p className="font-semibold">Ops! Ocorreu um problema na busca</p>
              <p className="text-xs sm:text-sm opacity-90">{errorMessage}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                userLocation
                  ? fetchChurches(userLocation.latitude, userLocation.longitude, radiusMeters, currentQuery || undefined)
                  : handleGetLocation()
              }
              className="h-8 text-xs shrink-0 cursor-pointer"
            >
              <RefreshCw className="mr-1.5 size-3" /> Tentar novamente
            </Button>
          </div>
        )}

        {status === "empty" && (
          <div className="rounded-2xl border border-border/80 bg-card p-8 text-center space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <ChurchIcon className="size-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Nenhuma igreja encontrada neste raio</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Não encontramos estabelecimentos em um raio de {radiusMeters / 1000} km em torno de {locationName || "sua localização"}. Tente aumentar o raio para 25 km ou 50 km, ou buscar outra região.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <Button size="sm" onClick={() => handleRadiusChange(25000)} className="text-xs cursor-pointer">
                Ampliar para 25 km
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleRadiusChange(50000)} className="text-xs cursor-pointer">
                Ampliar para 50 km
              </Button>
            </div>
          </div>
        )}

        {/* Estado Inicial (Apresentação antes de pesquisar) */}
        {status === "idle" && (
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <LocateFixed className="size-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Localização Automática</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clique em "Encontrar perto de mim" para ver as igrejas mais próximas com raio inicial de 5 km.
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Search className="size-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Busca por Denominação</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pesquise por igrejas evangélicas, católicas, batistas, assembleias de Deus, paróquias ou comunidades.
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Privacidade Garantida</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sua localização é processada exclusivamente no navegador para a consulta. Nunca é salva em banco de dados.
              </p>
            </div>
          </section>
        )}

        {/* ÁREA PRINCIPAL: MAPA + LISTA DE IGREJAS */}
        {(status === "success" || status === "loading" || churches.length > 0) && (
          <div className="space-y-4">
            {/* 1. Barra de Status dos Resultados: 'Encontramos X igrejas próximas' */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-gold animate-pulse" />
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Encontramos {churches.length} {churches.length === 1 ? "igreja próxima" : "igrejas próximas"}
                  {locationName && <span className="text-muted-foreground font-normal"> perto de {locationName}</span>}
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">
                Ordenado por distância • Raio atual: {radiusMeters / 1000} km
              </span>
            </div>

            {/* 2. Banner 'Não encontrou a igreja que procura? [Ampliar busca]' */}
            <div className="rounded-xl border border-border/80 bg-accent/25 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground">
                <HelpCircle className="size-4 text-gold shrink-0" />
                <span>Não encontrou a igreja que procura?</span>
              </div>
              {radiusMeters < 50000 ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleExpandRadius}
                  disabled={status === "loading" || isPending}
                  className="h-8 px-3 text-xs font-semibold shrink-0 cursor-pointer bg-background hover:bg-accent"
                >
                  <Sparkles className="mr-1.5 size-3.5 text-gold" />
                  Ampliar busca ({radiusMeters < 10000 ? "5 km → 10 km" : radiusMeters < 25000 ? "10 km → 25 km" : "25 km → 50 km"})
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Raio máximo alcançado (50 km)</span>
              )}
            </div>

            {/* 3. Layout Grid: Mapa e Lista */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Mapa Interativo (Mobile: Topo | Desktop: 7 colunas) */}
              <div className="lg:col-span-7 lg:sticky lg:top-20">
                <ChurchMap
                  userLocation={userLocation}
                  churches={churches}
                  selectedChurchId={selectedChurchId}
                  onSelectChurch={(church) => setSelectedChurchId(church.id)}
                  className="h-[340px] sm:h-[420px] lg:h-[580px] w-full"
                />
              </div>

              {/* Lista de Igrejas (Mobile: Abaixo | Desktop: 5 colunas com scroll) */}
              <div className="lg:col-span-5 space-y-3 max-h-[580px] lg:overflow-y-auto lg:pr-1">
                {status === "loading" && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-xl border border-border/60 bg-card p-4 space-y-2 animate-pulse">
                        <div className="h-4 bg-muted rounded-md w-3/4" />
                        <div className="h-3 bg-muted rounded-md w-full" />
                        <div className="h-3 bg-muted rounded-md w-1/3" />
                      </div>
                    ))}
                  </div>
                )}

                {churches.map((church) => {
                  const isSelected = selectedChurchId === church.id;
                  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    church.name + ", " + church.address,
                  )}`;

                  return (
                    <article
                      key={church.id}
                      onClick={() => setSelectedChurchId(church.id)}
                      className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
                        isSelected
                          ? "border-gold bg-accent/30 shadow-xs ring-1 ring-gold/40"
                          : "border-border/80 bg-card hover:border-gold/40 hover:bg-accent/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold font-bold">
                          <ChurchIcon className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-1">
                              {church.name}
                            </h3>
                            {typeof church.rating === "number" && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-gold shrink-0">
                                <Star className="size-3 fill-amber-500 text-amber-500" />
                                {church.rating.toFixed(1)}
                                {church.userRatingCount && (
                                  <span className="text-[10px] text-muted-foreground font-normal">
                                    ({church.userRatingCount})
                                  </span>
                                )}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            📍 {church.address}
                          </p>

                          {/* Distância e Status */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
                            <span className="text-gold font-semibold">
                              📏 {church.distanceKm} km de distância
                            </span>
                            {church.openNow !== undefined && (
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                  church.openNow
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <Clock className="size-3" />
                                {church.openNow ? "Aberto agora" : "Fechado"}
                              </span>
                            )}
                            {church.phoneNumber && (
                              <a
                                href={`tel:${church.phoneNumber}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <Phone className="size-3" />
                                {church.phoneNumber}
                              </a>
                            )}
                          </div>

                          {/* Botões de Ação */}
                          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedChurchId(church.id);
                              }}
                              className="h-8 px-3 text-xs font-medium cursor-pointer"
                            >
                              <MapPin className="mr-1.5 size-3.5 text-gold" />
                              Ver no mapa
                            </Button>

                            <Button
                              asChild
                              size="sm"
                              className="h-8 px-3 text-xs font-semibold bg-gold text-primary-foreground hover:bg-gold/90 shadow-xs cursor-pointer"
                            >
                              <a
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Navigation className="mr-1.5 size-3.5" />
                                🧭 Como chegar
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Aviso sobre Cobertura */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-[11px] text-muted-foreground leading-relaxed">
              <p>
                <strong>Nota sobre cobertura:</strong> O objetivo é encontrar o maior número possível de igrejas disponíveis no Google Places. Nem todo templo, capela ou congregação necessariamente estará cadastrado ou atualizado na base de dados de mapas da sua região.
              </p>
            </div>
          </div>
        )}

        {/* Rodapé de Privacidade e Conformidade LGPD */}
        <section className="rounded-2xl border border-border/80 bg-accent/15 p-4 sm:p-5 text-xs text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>Compromisso de Privacidade e LGPD</span>
          </div>
          <p className="leading-relaxed">
            Sua localização geográfica é solicitada exclusivamente mediante o seu clique voluntário e é processada
            apenas em tempo real para o cálculo de distâncias. <strong>Não armazenamos suas coordenadas no banco de dados</strong> nem vinculamos sua localização à sua conta pessoal. Para saber mais, consulte nossa{" "}
            <Link to="/privacidade" className="underline text-primary hover:text-primary/80">
              Política de Privacidade
            </Link>
            .
          </p>
        </section>
      </main>
    </SiteLayout>
  );
}
