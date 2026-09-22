import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getFriendlyAuthErrorMessage } from "@/lib/auth-context";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir Senha — Bíblia Online" },
      { name: "description", content: "Redefina a senha de acesso à sua conta." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: RedefinirSenhaPage,
});

type PageState = "verifying" | "ready" | "expired" | "success";

function RedefinirSenhaPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>("verifying");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initRecovery() {
      if (typeof window === "undefined") return;

      const searchParams = new URLSearchParams(window.location.search);
      const hashString = window.location.hash.replace(/^#/, "");
      const hashParams = new URLSearchParams(hashString);

      // 1. Checar se a URL traz erro explícito do Supabase (ex: otp_expired)
      const error = searchParams.get("error") || hashParams.get("error");
      const errorCode = searchParams.get("error_code") || hashParams.get("error_code");
      if (error || errorCode === "otp_expired") {
        if (isMounted) setState("expired");
        return;
      }

      // 2. Fluxo PKCE: URL com query param `code`
      const code = searchParams.get("code");
      if (code) {
        try {
          const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (!isMounted) return;
          if (exchangeErr || !data.session) {
            setState("expired");
            return;
          }
          setState("ready");
          return;
        } catch {
          if (isMounted) setState("expired");
          return;
        }
      }

      // 3. Fluxo token_hash (ex: /verify com token_hash & type=recovery)
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      if (tokenHash && type === "recovery") {
        try {
          const { data, error: otpErr } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (!isMounted) return;
          if (otpErr || !data.session) {
            setState("expired");
            return;
          }
          setState("ready");
          return;
        } catch {
          if (isMounted) setState("expired");
          return;
        }
      }

      // 4. Fluxo Hash com access_token e refresh_token (Implicit Flow)
      const hasAccessToken = hashParams.has("access_token");
      const hashType = hashParams.get("type");
      if (hasAccessToken && (hashType === "recovery" || !hashType)) {
        const accessToken = hashParams.get("access_token")!;
        const refreshToken = hashParams.get("refresh_token") || "";
        try {
          const { data, error: sessionErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!isMounted) return;
          if (sessionErr || !data.session) {
            setState("expired");
            return;
          }
          setState("ready");
          return;
        } catch {
          if (isMounted) setState("expired");
          return;
        }
      }

      // 5. Verificar sessão existente com getSession
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session) {
          // Se já tem sessão e a URL indicava recuperação ou o hash contém recovery
          setState("ready");
          return;
        }
      } catch {
        // silencioso
      }

      // 6. Se nenhum token/sessão foi detectado após 2 segundos, marcar como expirado
      const timer = setTimeout(() => {
        if (isMounted && state === "verifying") {
          setState("expired");
        }
      }, 2000);

      return () => clearTimeout(timer);
    }

    initRecovery();

    // Ouvinte para o evento PASSWORD_RECOVERY do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        setState("ready");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!password) {
      toast.error("Por favor, digite a nova senha.");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!confirmPassword) {
      toast.error("Por favor, confirme a nova senha.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas digitadas não coincidem.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("expired") || msg.includes("invalid") || msg.includes("jwt")) {
          setState("expired");
        } else {
          toast.error(getFriendlyAuthErrorMessage(error));
        }
        setIsSubmitting(false);
        return;
      }

      // Sucesso: deslogar para garantir que o usuário entre do zero com a nova senha
      await supabase.auth.signOut().catch(() => {});
      setIsSubmitting(false);
      setState("success");
    } catch (err) {
      setIsSubmitting(false);
      toast.error(getFriendlyAuthErrorMessage(err));
    }
  }

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
        {/* ESTADO 1: VERIFICANDO LINK */}
        {state === "verifying" && (
          <div className="surface p-8 text-center space-y-4 rounded-2xl border border-border animate-pulse">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gold/15 text-gold">
              <KeyRound className="size-6 animate-spin" />
            </div>
            <h1 className="font-display text-2xl font-semibold">Validando link de recuperação</h1>
            <p className="text-sm text-muted-foreground">
              Aguarde um instante enquanto verificamos seu acesso seguro...
            </p>
          </div>
        )}

        {/* ESTADO 2: LINK EXPIRADO OU INVÁLIDO */}
        {state === "expired" && (
          <div className="surface p-6 sm:p-8 text-center space-y-5 rounded-2xl border border-destructive/30 shadow-xs">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-8" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold">
                Este link de recuperação expirou ou não é mais válido.
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Por motivos de segurança, os links de redefinição possuem tempo limite de validade ou só podem ser utilizados uma única vez.
              </p>
            </div>
            <div className="pt-2">
              <Button asChild className="w-full h-11 font-medium bg-gold text-primary-foreground hover:bg-gold/90">
                <Link to="/auth" search={{ mode: "forgot" }}>
                  Solicitar novo link
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* ESTADO 3: FORMULÁRIO PRONTO PARA REDEFINIÇÃO */}
        {state === "ready" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-semibold">Redefinir senha</h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Digite sua nova senha abaixo para restaurar o acesso à sua conta.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="surface space-y-4 p-6 rounded-2xl border border-border shadow-xs">
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-sm font-medium">
                  Nova senha <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    disabled={isSubmitting}
                  />
                  <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground p-0.5"
                    aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirmar nova senha <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 pr-10"
                    disabled={isSubmitting}
                  />
                  <KeyRound className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground p-0.5"
                    aria-label={showConfirmPassword ? "Ocultar senha" : "Ver senha"}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium bg-gold text-primary-foreground hover:bg-gold/90 transition-all mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Alterando senha..." : "Alterar senha"}
              </Button>
            </form>
          </div>
        )}

        {/* ESTADO 4: SUCESSO */}
        {state === "success" && (
          <div className="surface p-6 sm:p-8 text-center space-y-5 rounded-2xl border border-gold/40 shadow-xs">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold">
                Senha alterada com sucesso!
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sua credencial de acesso foi atualizada com segurança. Agora você pode entrar com sua nova senha.
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => {
                  toast.success("Por favor, faça login com sua nova senha.");
                  navigate({ to: "/auth", search: { mode: "signin" } });
                }}
                className="w-full h-11 font-medium bg-gold text-primary-foreground hover:bg-gold/90 flex items-center justify-center gap-2"
              >
                <span>Entrar</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
