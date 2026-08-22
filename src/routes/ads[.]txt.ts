import { createFileRoute } from "@tanstack/react-router";
import { getAdSettings } from "@/lib/ads.functions";

const FALLBACK = `# ads.txt — Bíblia Online
# Configure a linha oficial do AdSense em /admin.
`;

export const Route = createFileRoute("/ads.txt")({
  server: {
    handlers: {
      GET: async () => {
        let body = FALLBACK;
        try {
          const settings = await getAdSettings();
          if (settings.adsTxt.trim()) {
            body = `${settings.adsTxt.trim()}\n`;
          } else if (settings.publisherId) {
            body = `google.com, ${settings.publisherId.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`;
          }
        } catch {
          /* mantém o fallback */
        }
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=600",
          },
        });
      },
    },
  },
});
