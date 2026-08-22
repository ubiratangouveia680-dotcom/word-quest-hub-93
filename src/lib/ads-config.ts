/**
 * Configuração de publicidade.
 *
 * Para ativar o Google AdSense:
 * 1. Defina VITE_ADSENSE_PUBLISHER_ID (ex.: "ca-pub-0000000000000000")
 *    e os IDs de bloco em VITE_ADSENSE_SLOT_* nas variáveis de ambiente.
 * 2. Publique o arquivo public/ads.txt com a linha fornecida pelo AdSense.
 *
 * Nenhum ID é inventado aqui: enquanto não houver configuração real,
 * os componentes exibem apenas espaços reservados.
 */
const env = import.meta.env as Record<string, string | undefined>;

export const adsConfig = {
  enabled: env["VITE_ADS_ENABLED"] !== "false",
  publisherId: env["VITE_ADSENSE_PUBLISHER_ID"] ?? "",
  slots: {
    banner: env["VITE_ADSENSE_SLOT_BANNER"] ?? "",
    mobile: env["VITE_ADSENSE_SLOT_MOBILE"] ?? "",
    desktop: env["VITE_ADSENSE_SLOT_DESKTOP"] ?? "",
    inArticle: env["VITE_ADSENSE_SLOT_IN_ARTICLE"] ?? "",
    endOfChapter: env["VITE_ADSENSE_SLOT_END_OF_CHAPTER"] ?? "",
  } as Record<string, string>,
};

export const analyticsConfig = {
  gaMeasurementId: env["VITE_GA_MEASUREMENT_ID"] ?? "",
};
