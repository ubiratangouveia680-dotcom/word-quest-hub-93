import type { ReactNode } from "react";
import { SiteLayout } from "@/components/SiteLayout";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        <div className="gold-rule my-6" />
        <div className="space-y-4 text-muted-foreground [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed">
          {children}
        </div>
      </div>
    </SiteLayout>
  );
}
