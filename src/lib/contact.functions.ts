import { createServerFn } from "@tanstack/react-start";

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string;
  userId?: string | null;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  provider?: string;
}

const TARGET_EMAIL = "ubiratan.silva.gouveia@gmail.com";

export function sanitizeText(text: string): string {
  return String(text || "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/onload=/gi, "")
    .replace(/onerror=/gi, "");
}

export const sendContactMessage = createServerFn({ method: "POST" })
  .validator((data: ContactInput) => {
    const name = sanitizeText(data.name).trim();
    const email = sanitizeText(data.email).trim();
    const subject = sanitizeText(data.subject).trim();
    const message = sanitizeText(data.message).trim();
    const honeypot = String(data.honeypot || "").trim();
    const userId = data.userId ? String(data.userId) : null;

    if (!name || name.length < 2) {
      throw new Error("Por favor, informe seu nome (mínimo de 2 caracteres).");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Por favor, informe um endereço de e-mail válido.");
    }
    if (!message || message.length < 10) {
      throw new Error("Sua mensagem deve conter no mínimo 10 caracteres.");
    }
    if (message.length > 5000) {
      throw new Error("A mensagem excede o limite máximo de 5.000 caracteres.");
    }

    return {
      name: name.slice(0, 100),
      email: email.slice(0, 150),
      subject: (subject || "Mensagem de Contato").slice(0, 200),
      message: message.slice(0, 5000),
      honeypot,
      userId,
    };
  })
  .handler(async ({ data }): Promise<ContactResponse> => {
    // 1. Armadilha anti-bot (Honeypot): se preenchido, responde sucesso silencioso para enganar bots
    if (data.honeypot && data.honeypot.length > 0) {
      return {
        success: true,
        message: "Mensagem recebida com sucesso!",
        provider: "honeypot",
      };
    }

    let sent = false;
    let usedProvider = "";

    // 2. Provedor 1: Resend (se chave RESEND_API_KEY estiver configurada no servidor)
    const resendApiKey = process.env["RESEND_API_KEY"];
    if (resendApiKey) {
      try {
        const fromEmail = process.env["CONTACT_FROM_EMAIL"] || "Word Quest Hub <onboarding@resend.dev>";
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [TARGET_EMAIL],
            reply_to: data.email,
            subject: `[Contato Word Quest Hub] ${data.subject} - ${data.name}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #92400e; color: #ffffff; padding: 24px; text-align: center;">
                  <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Word Quest Hub</h1>
                  <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Nova mensagem recebida pelo formulário de contato</p>
                </div>
                <div style="padding: 28px; color: #1e293b; line-height: 1.6;">
                  <div style="background-color: #f8fafc; border-left: 4px solid #d97706; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                    <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Remetente:</strong> ${data.name}</p>
                    <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>E-mail:</strong> <a href="mailto:${data.email}" style="color: #92400e; text-decoration: none; font-weight: 600;">${data.email}</a></p>
                    <p style="margin: 0; font-size: 14px;"><strong>Assunto:</strong> ${data.subject}</p>
                  </div>
                  <h3 style="font-size: 15px; color: #475569; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Mensagem:</h3>
                  <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 18px; border-radius: 8px; font-size: 15px; color: #451a03; white-space: pre-wrap;">${data.message}</div>
                  <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center;">
                    <a href="mailto:${data.email}?subject=Re: [Word Quest Hub] ${encodeURIComponent(data.subject)}" style="display: inline-block; background-color: #92400e; color: #ffffff; font-weight: 600; font-size: 13px; padding: 10px 22px; border-radius: 6px; text-decoration: none;">Responder a ${data.name}</a>
                  </div>
                </div>
                <div style="background-color: #f1f5f9; padding: 14px; text-align: center; font-size: 12px; color: #64748b;">
                  Enviado em ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} pelo Word Quest Hub.
                </div>
              </div>
            `,
          }),
        });

        if (resendRes.ok) {
          sent = true;
          usedProvider = "resend";
        } else {
          const errText = await resendRes.text();
          console.warn("Resend retornou status não-ok:", resendRes.status, errText);
        }
      } catch (err) {
        console.warn("Falha ao disparar pelo Resend:", err);
      }
    }

    // 3. Provedor 2: FormSubmit (entrega direta garantida para ubiratan.silva.gouveia@gmail.com)
    if (!sent) {
      try {
        const fsRes = await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Origin: "https://word-quest-hub-93.lovable.app",
            Referer: "https://word-quest-hub-93.lovable.app/contato",
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            _subject: `[Contato Word Quest Hub] ${data.subject} - ${data.name}`,
            subject: data.subject,
            message: data.message,
            _replyto: data.email,
            _template: "table",
            _captcha: "false",
          }),
        });

        if (fsRes.ok) {
          sent = true;
          usedProvider = "formsubmit";
        } else {
          console.warn("FormSubmit retornou erro:", fsRes.status);
        }
      } catch (err) {
        console.warn("Falha ao disparar pelo FormSubmit:", err);
      }
    }

    // 4. Registro no banco de dados Supabase como cópia de segurança
    try {
      const supabaseUrl = process.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
      const supabaseKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] || process.env["VITE_SUPABASE_ANON_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];

      if (supabaseUrl && supabaseKey) {
        await fetch(`${supabaseUrl}/rest/v1/contact_messages`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
            user_id: data.userId,
            status: sent ? "sent" : "pending",
          }),
        }).catch(() => {});
      }
    } catch {}

    if (sent) {
      return {
        success: true,
        message: "Mensagem enviada com sucesso! Obrigado pelo contato.",
        provider: usedProvider,
      };
    }

    return {
      success: false,
      message: "Não foi possível enviar sua mensagem no momento. Por favor, tente novamente ou entre em contato diretamente pelo e-mail ubiratan.silva.gouveia@gmail.com.",
    };
  });
