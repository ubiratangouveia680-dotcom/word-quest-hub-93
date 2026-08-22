/**
 * Configuração de publicidade.
 *
 * Os valores reais são guardados no banco (tabela `ad_settings`) e editados
 * em /admin apenas por administradores. As variáveis de ambiente abaixo são
 * usadas apenas como valor inicial/fallback.
 *
 * Nenhum ID é inventado: enquanto não houver configuração real, os
 * componentes exibem apenas espaços reservados.
 */
const env = import.meta.env as Record<string, string | undefined>;

export type AdSlotName = "banner" | "mobile" | "desktop" | "inArticle" | "endOfChapter";

export interface AdSettings {
  enabled: boolean;
  publisherId: string;
  slots: Record<AdSlotName, string>;
  gaMeasurementId: string;
  adsTxt: string;
  updatedAt: string | null;
}

export const AD_SLOT_LABELS: Record<AdSlotName, string> = {
  banner: "Banner superior",
  mobile: "Mobile (rodapé de conteúdo)",
  desktop: "Sidebar desktop",
  inArticle: "Dentro do artigo",
  endOfChapter: "Fim do capítulo",
};

export const defaultAdSettings: AdSettings = {
  enabled: env["VITE_ADS_ENABLED"] !== "false",
  publisherId: env["VITE_ADSENSE_PUBLISHER_ID"] ?? "",
  slots: {
    banner: env["VITE_ADSENSE_SLOT_BANNER"] ?? "",
    mobile: env["VITE_ADSENSE_SLOT_MOBILE"] ?? "",
    desktop: env["VITE_ADSENSE_SLOT_DESKTOP"] ?? "",
    inArticle: env["VITE_ADSENSE_SLOT_IN_ARTICLE"] ?? "",
    endOfChapter: env["VITE_ADSENSE_SLOT_END_OF_CHAPTER"] ?? "",
  },
  gaMeasurementId: env["VITE_GA_MEASUREMENT_ID"] ?? "",
  adsTxt: "",
  updatedAt: null,
};

/** ca-pub- seguido de 16 dígitos (formato oficial do AdSense). */
export const PUBLISHER_ID_PATTERN = /^ca-pub-\d{16}$/;
/** Blocos de anúncio são numéricos (10 dígitos, normalmente). */
export const AD_SLOT_PATTERN = /^\d{8,16}$/;
/** G-XXXXXXX (GA4). */
export const GA_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;

export function validateAdSettingsInput(input: {
  publisherId: string;
  slots: Record<string, string>;
  gaMeasurementId: string;
}): string[] {
  const errors: string[] = [];
  if (input.publisherId && !PUBLISHER_ID_PATTERN.test(input.publisherId)) {
    errors.push('O Publisher ID deve seguir o formato "ca-pub-" seguido de 16 dígitos.');
  }
  for (const [key, value] of Object.entries(input.slots)) {
    if (value && !AD_SLOT_PATTERN.test(value)) {
      errors.push(`O bloco "${AD_SLOT_LABELS[key as AdSlotName] ?? key}" deve conter apenas dígitos.`);
    }
  }
  if (input.gaMeasurementId && !GA_ID_PATTERN.test(input.gaMeasurementId)) {
    errors.push('O ID do Google Analytics deve começar com "G-".');
  }
  return errors;
}
