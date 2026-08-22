import { adsConfig } from "@/lib/ads-config";

interface AdProps {
  slotName: string;
  className?: string;
}

/**
 * Placeholder de anúncio. Enquanto o AdSense não estiver configurado
 * (ver src/lib/ads-config.ts e a página /admin/anuncios), é exibido um
 * espaço reservado neutro — nunca um anúncio falso ou botão imitado.
 */
function AdSlot({ slotName, className = "", label, minHeight }: AdProps & { label: string; minHeight: number }) {
  if (!adsConfig.enabled) return null;

  const configured = Boolean(adsConfig.publisherId && adsConfig.slots[slotName]);

  return (
    <aside
      aria-label="Publicidade"
      className={`w-full overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 ${className}`}
      style={{ minHeight }}
    >
      <div className="flex h-full min-h-[inherit] flex-col items-center justify-center gap-1 px-4 py-6 text-center">
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Publicidade</span>
        {!configured && (
          <span className="text-xs text-muted-foreground/80">
            Espaço reservado · {label}
          </span>
        )}
        {configured && (
          <ins
            className="adsbygoogle block w-full"
            data-ad-client={adsConfig.publisherId}
            data-ad-slot={adsConfig.slots[slotName]}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        )}
      </div>
    </aside>
  );
}

export const AdBanner = ({ className }: { className?: string }) => (
  <AdSlot slotName="banner" label="Banner superior" minHeight={90} className={className} />
);

export const AdMobile = ({ className }: { className?: string }) => (
  <AdSlot slotName="mobile" label="Mobile" minHeight={100} className={`md:hidden ${className ?? ""}`} />
);

export const AdDesktop = ({ className }: { className?: string }) => (
  <AdSlot slotName="desktop" label="Sidebar desktop" minHeight={250} className={`hidden md:block ${className ?? ""}`} />
);

export const AdInArticle = ({ className }: { className?: string }) => (
  <AdSlot slotName="inArticle" label="Dentro do artigo" minHeight={120} className={className} />
);

export const AdEndOfChapter = ({ className }: { className?: string }) => (
  <AdSlot slotName="endOfChapter" label="Fim do capítulo" minHeight={120} className={className} />
);
