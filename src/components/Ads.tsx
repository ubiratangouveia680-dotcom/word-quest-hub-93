import { useEffect, useRef } from "react";
import { useAdSettings } from "@/lib/ads-context";
import { AD_SLOT_LABELS, type AdSlotName } from "@/lib/ads-config";

interface AdProps {
  slotName: AdSlotName;
  className?: string | undefined;
}

/**
 * Bloco de anúncio. Enquanto o AdSense não estiver configurado em /admin,
 * é exibido um espaço reservado neutro — nunca um anúncio falso.
 */
function AdSlot({ slotName, className = "", minHeight }: AdProps & { minHeight: number }) {
  const settings = useAdSettings();
  const insRef = useRef<HTMLModElement | null>(null);
  const pushed = useRef(false);

  const slotId = settings.slots[slotName];
  const configured = Boolean(settings.enabled && settings.publisherId && slotId);

  useEffect(() => {
    if (!configured || pushed.current || !insRef.current) return;
    pushed.current = true;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      /* bloqueador de anúncios: ignorar silenciosamente */
    }
  }, [configured, slotId]);

  if (!settings.enabled || !configured) return null;

  return (
    <aside
      aria-label="Publicidade"
      className={`w-full overflow-hidden my-6 ${className}`}
      style={{ minHeight }}
    >
      <div className="flex flex-col items-center justify-center">
        <span className="mb-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
          Publicidade
        </span>
        <ins
          key={`${settings.publisherId}-${slotId}`}
          ref={insRef}
          className="adsbygoogle block w-full text-center"
          style={{ display: "block" }}
          data-ad-client={settings.publisherId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}

export const AdBanner = ({ className }: { className?: string }) => (
  <AdSlot slotName="banner" minHeight={90} className={className} />
);

export const AdMobile = ({ className }: { className?: string }) => (
  <AdSlot slotName="mobile" minHeight={100} className={`md:hidden ${className ?? ""}`} />
);

export const AdDesktop = ({ className }: { className?: string }) => (
  <AdSlot slotName="desktop" minHeight={250} className={`hidden md:block ${className ?? ""}`} />
);

export const AdInArticle = ({ className }: { className?: string }) => (
  <AdSlot slotName="inArticle" minHeight={120} className={className} />
);

export const AdEndOfChapter = ({ className }: { className?: string }) => (
  <AdSlot slotName="endOfChapter" minHeight={120} className={className} />
);
