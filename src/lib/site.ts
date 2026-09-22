export const SITE_URL = "https://bibliaonlineoficial.com.br";
export const SITE_NAME = "Bíblia Online Oficial";
export const SITE_SLOGAN = "Leia, compreenda e compartilhe a Palavra de Deus.";
export const url = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
export const GOOGLE_SITE_VERIFICATION =
  (typeof process !== "undefined" ? process.env?.["GOOGLE_SITE_VERIFICATION"] || process.env?.["VITE_GOOGLE_SITE_VERIFICATION"] : "") ||
  "";
