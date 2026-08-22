import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import {
  defaultAdSettings,
  validateAdSettingsInput,
  type AdSettings,
  type AdSlotName,
} from "@/lib/ads-config";

type Row = Database["public"]["Tables"]["ad_settings"]["Row"];

function toSettings(row: Row | null): AdSettings {
  if (!row) return defaultAdSettings;
  return {
    enabled: row.ads_enabled,
    publisherId: row.publisher_id || defaultAdSettings.publisherId,
    slots: {
      banner: row.slot_banner || defaultAdSettings.slots.banner,
      mobile: row.slot_mobile || defaultAdSettings.slots.mobile,
      desktop: row.slot_desktop || defaultAdSettings.slots.desktop,
      inArticle: row.slot_in_article || defaultAdSettings.slots.inArticle,
      endOfChapter: row.slot_end_of_chapter || defaultAdSettings.slots.endOfChapter,
    },
    gaMeasurementId: row.ga_measurement_id || defaultAdSettings.gaMeasurementId,
    adsTxt: row.ads_txt ?? "",
    updatedAt: row.updated_at,
  };
}

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Leitura pública: apenas IDs que já ficariam visíveis no HTML dos anúncios. */
export const getAdSettings = createServerFn({ method: "GET" }).handler(async (): Promise<AdSettings> => {
  try {
    const { data } = await publicClient()
      .from("ad_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    return toSettings(data);
  } catch {
    return defaultAdSettings;
  }
});

/** Diz se o usuário logado é administrador (validado no servidor, via RLS). */
export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isAdmin: boolean; email: string | null }> => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    const email = (context.claims as { email?: string } | null)?.email ?? null;
    return { isAdmin: Boolean(data), email };
  });

interface UpdateInput {
  enabled: boolean;
  publisherId: string;
  slots: Record<AdSlotName, string>;
  gaMeasurementId: string;
  adsTxt: string;
}

export const updateAdSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: UpdateInput): UpdateInput => {
    const trim = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const clean: UpdateInput = {
      enabled: Boolean(input?.enabled),
      publisherId: trim(input?.publisherId),
      slots: {
        banner: trim(input?.slots?.banner),
        mobile: trim(input?.slots?.mobile),
        desktop: trim(input?.slots?.desktop),
        inArticle: trim(input?.slots?.inArticle),
        endOfChapter: trim(input?.slots?.endOfChapter),
      },
      gaMeasurementId: trim(input?.gaMeasurementId).toUpperCase(),
      adsTxt: trim(input?.adsTxt).slice(0, 2000),
    };
    const errors = validateAdSettingsInput(clean);
    if (errors.length > 0) throw new Error(errors.join(" "));
    return clean;
  })
  .handler(async ({ data, context }): Promise<AdSettings> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Acesso restrito a administradores.");

    const { data: row, error } = await context.supabase
      .from("ad_settings")
      .update({
        ads_enabled: data.enabled,
        publisher_id: data.publisherId,
        slot_banner: data.slots.banner,
        slot_mobile: data.slots.mobile,
        slot_desktop: data.slots.desktop,
        slot_in_article: data.slots.inArticle,
        slot_end_of_chapter: data.slots.endOfChapter,
        ga_measurement_id: data.gaMeasurementId,
        ads_txt: data.adsTxt,
        updated_by: context.userId,
      })
      .eq("id", 1)
      .select("*")
      .maybeSingle();

    if (error) throw new Error("Não foi possível salvar as configurações.");
    return toSettings(row);
  });
