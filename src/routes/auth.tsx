import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, KeyRound, Lock, Mail, User } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar ou Cadastrar — Bíblia Online" },
      { name: "description", content: "Acesse sua conta do portal Bíblia Online." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function isSafePath(value: string | null): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

type AuthMode = "signin" | "signup" | "forgot" | "recovery";

function AuthPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword, updatePassword, isLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState("/perfil");
  const [recoveryEmailSent, setRecoveryEmailSent] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextParam = params.get("next") || params.get("returnUrl");
    if (isSafePath(nextParam)) {
      setNext(nextParam);
    }

    const modeParam = params.get("mode");
    if (modeParam === "signup") {
      setMode("signup");
    } else if (modeParam === "forgot") {
      setMode("forgot");
    } else if (modeParam === "recovery" || window.location.hash.includes("type=recovery")) {
      setMode("recovery");
    }
  }, []);

  useEffect(() => {
    // Se o usuário já estiver logado e não estiver no fluxo de redefinição de senha, redireciona
    if (!isLoading && user && mode !== "recovery") {
      navigate({ to: next as any });
    }
  }, [user, isLoading, mode, next, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "signup") {
      if (!name.trim() || name.trim().length < 2) {
        toast.error("Por favor, informe seu nome completo (mínimo 2 caracteres).");
        return;
      }
      if (password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("As senhas digitadas não coincidem.");
        return;
      }

      setLoading(true);
      const { error, user: newUser } = await signUp(name, email, password);
      setLoading(false);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Conta criada com sucesso!");
        if (newUser && !newUser.confirmed_at && newUser.identities?.length) {
          toast.info("Verifique seu e-mail para confirmar o cadastro, se necessário.");
        }
        navigate({ to: next as any });
      }
      return;
    }

    if (mode === "signin") {
      if (!email.trim() || !password) {
        toast.error("Preencha seu e-mail e sua senha para entrar.");
        return;
      }

      setLoading(true);
      const { error } = await signIn(email, password);
      setLoading(false);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Login realizado com sucesso! Bem-vindo(a).");
        navigate({ to: next as any });
      }
      return;
    }

    if (mode === "forgot") {
      if (!email.trim() || !email.includes("@")) {
        toast.error("Por favor, informe um endereço de e-mail válido.");
        return;
      }

      setLoading(true);
      const { error } = await resetPassword(email);
      setLoading(false);

      if (error) {
        toast.error(error.message);
      } else {
        setRecoveryEmailSent(true);
        toast.success("E-mail de recuperação enviado com sucesso!");
      }
      return;
    }

    if (mode === "recovery") {
      if (password.length < 6) {
        toast.error("A nova senha deve ter pelo menos 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("As senhas digitadas não coincidem.");
        return;
      }

      setLoading(true);
      const { error } = await updatePassword(password);
      setLoading(false);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Senha alterada com sucesso.");
        setMode("signin");
        navigate({ to: "/perfil" });
      }
      return;
    }
  }

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setRecoveryEmailSent(false);
            }}
            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 size-4" /> Voltar para o login
          </button>
        )}

        <h1 className="font-display text-3xl font-semibold">
          {mode === "signin" && "Entrar"}
          {mode === "signup" && "Criar conta"}
          {mode === "forgot" && "Recuperar senha"}
          {mode === "recovery" && "Redefinir senha"}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {mode === "signin" &&
            "Acesse sua conta para sincronizar seus versículos favoritos, histórico de leitura e preferências."}
          {mode === "signup" &&
            "Cadastre-se gratuitamente para salvar seus versículos favoritos e manter seu progresso de leitura sincronizado."}
          {mode === "forgot" &&
            "Informe seu e-mail cadastrado. Enviaremos um link seguro para você redefinir sua senha."}
          {mode === "recovery" &&
            "Digite e confirme sua nova senha de acesso à conta do Bíblia Online."}
        </p>

        {recoveryEmailSent ? (
          <div className="surface mt-6 p-6 text-center space-y-4 rounded-xl border border-gold/40">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gold/15 text-gold">
              <CheckCircle2 className="size-7" />
            </div>
            <h2 className="font-display text-xl font-semibold">E-mail Enviado!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enviamos um link de redefinição para <strong>{email}</strong>. Verifique sua caixa de entrada e pasta de spam.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setRecoveryEmailSent(false);
                setMode("signin");
              }}
              className="mt-2 w-full"
            >
              Voltar para Entrar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="surface mt-6 space-y-4 p-5 rounded-xl border border-border">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome completo <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9"
                  />
                  <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {mode !== "recovery" && (
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  E-mail <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                  <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {mode === "recovery" ? "Nova Senha" : "Senha"}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-gold hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    autoComplete={
                      mode === "signin"
                        ? "current-password"
                        : mode === "recovery"
                        ? "new-password"
                        : "new-password"
                    }
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                  <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {(mode === "signup" || mode === "recovery") && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar Senha <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                  />
                  <KeyRound className="absolute left-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
              {loading ? (
                "Aguarde…"
              ) : mode === "signin" ? (
                "Entrar"
              ) : mode === "signup" ? (
                "Criar conta"
              ) : mode === "forgot" ? (
                "Enviar link de recuperação"
              ) : (
                "Salvar nova senha"
              )}
            </Button>

            {mode === "signin" && (
              <div className="pt-2 text-center">
                <p className="text-sm text-muted-foreground">
                  Não possui uma conta?{" "}
                  <button
                    type="button"
                    className="font-medium text-foreground underline hover:text-gold"
                    onClick={() => setMode("signup")}
                  >
                    Criar conta
                  </button>
                </p>
              </div>
            )}

            {mode === "signup" && (
              <div className="pt-2 text-center">
                <p className="text-sm text-muted-foreground">
                  Já possui uma conta?{" "}
                  <button
                    type="button"
                    className="font-medium text-foreground underline hover:text-gold"
                    onClick={() => setMode("signin")}
                  >
                    Entrar
                  </button>
                </p>
              </div>
            )}
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
