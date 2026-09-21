import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const canonicalRedirectMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    const url = new URL(request.url);
    const host = url.host.toLowerCase();
    const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");

    let shouldRedirect = false;

    // 1. Redireciona www.bibliaonlineoficial.com.br para o domínio canônico
    if (host === "www.bibliaonlineoficial.com.br") {
      url.host = "bibliaonlineoficial.com.br";
      shouldRedirect = true;
    }

    // 2. Redireciona http -> https no domínio oficial
    if (host.includes("bibliaonlineoficial.com.br") && proto === "http") {
      url.protocol = "https:";
      shouldRedirect = true;
    }

    if (shouldRedirect) {
      return new Response(null, {
        status: 301,
        headers: {
          Location: url.toString(),
        },
      });
    }
  } catch {}

  return await next();
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [canonicalRedirectMiddleware, errorMiddleware, csrfMiddleware],
}));

