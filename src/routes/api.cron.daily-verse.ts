import { createFileRoute } from "@tanstack/react-router";
import { dispatchDailyVersePush } from "@/lib/push.functions";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/cron/daily-verse")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Autentica requisições de cron se houver secret configurado
        const authError = await authenticateCronRequest(request).catch(() => null);
        if (authError && process.env["LOVABLE_CRON_SECRET"]) {
          return authError;
        }

        try {
          const result = await dispatchDailyVersePush({ force: false });
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err?.message || String(err) }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
      POST: async ({ request }) => {
        const authError = await authenticateCronRequest(request).catch(() => null);
        if (authError && process.env["LOVABLE_CRON_SECRET"]) {
          return authError;
        }

        try {
          const result = await dispatchDailyVersePush({ force: true });
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err?.message || String(err) }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
