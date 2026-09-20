import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: Error | null; user: User | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateProfile: (patch: { name?: string; avatar_url?: string | null }) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getFriendlyAuthErrorMessage(error: AuthError | Error | unknown): string {
  if (!error) return "";
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes("Invalid login credentials")) {
    return "E-mail ou senha incorretos. Por favor, verifique seus dados.";
  }
  if (msg.includes("Email not confirmed")) {
    return "E-mail ainda não confirmado. Verifique sua caixa de entrada ou spam para confirmar seu cadastro.";
  }
  if (msg.includes("User already registered") || msg.includes("already exists")) {
    return "Já existe uma conta cadastrada com este endereço de e-mail.";
  }
  if (msg.includes("Password should be at least")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  if (msg.includes("weak and easy to guess") || msg.includes("weak_password") || msg.includes("pwned")) {
    return "Esta senha é considerada fraca ou muito comum. Por favor, escolha uma senha mais segura (ex: use letras maiúsculas, minúsculas, números e símbolos).";
  }
  if (msg.includes("over_email_send_rate_limit") || msg.includes("email_rate_limit_exceeded")) {
    return "Limite temporário de envio de e-mails atingido pelo Supabase. Aguarde alguns minutos ou desative a confirmação de e-mail no painel do Supabase.";
  }
  if (msg.includes("rate limit") || msg.includes("Too many requests")) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.";
  }
  if (msg.includes("Unable to validate email address: invalid format")) {
    return "Formato de e-mail inválido. Digite um e-mail válido.";
  }
  if (msg.includes("Signups not allowed") || msg.includes("signup_disabled")) {
    return "O cadastro de novos usuários está desativado nas configurações do Supabase.";
  }
  return msg || "Ocorreu um erro ao processar sua solicitação. Tente novamente.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (userId: string, userEmail?: string, userMetaName?: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.warn("Erro ao buscar perfil:", error.message);
      }

      if (data) {
        setProfile(data as UserProfile);
      } else {
        // Se ainda não existir perfil (ex: trigger não disparado), cria perfil local/remoto
        const fallbackName = userMetaName || (userEmail ? userEmail.split("@")[0] : "Usuário");
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .upsert({
            user_id: userId,
            email: userEmail || null,
            name: fallbackName,
          }, { onConflict: "user_id" })
          .select("*")
          .maybeSingle();

        if (!insertError && newProfile) {
          setProfile(newProfile as UserProfile);
        } else {
          setProfile({
            id: userId,
            user_id: userId,
            name: fallbackName,
            email: userEmail || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error("Falha ao sincronizar perfil:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.name || session.user.user_metadata?.full_name
        ).finally(() => {
          if (isMounted) setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    // 2. Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(
            currentSession.user.id,
            currentSession.user.email,
            currentSession.user.user_metadata?.name || currentSession.user.user_metadata?.full_name
          );
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(
        user.id,
        user.email,
        user.user_metadata?.name || user.user_metadata?.full_name
      );
    }
  }, [user, fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        return { error: new Error(getFriendlyAuthErrorMessage(error)) };
      }
      return { error: null };
    } catch (err) {
      return { error: new Error(getFriendlyAuthErrorMessage(err)) };
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      const trimmedEmail = email.trim();
      const trimmedName = name.trim();
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            name: trimmedName,
            full_name: trimmedName,
          },
          emailRedirectTo: `${window.location.origin}/perfil`,
        },
      });

      if (error) {
        return { error: new Error(getFriendlyAuthErrorMessage(error)), user: null };
      }

      // Se o Supabase retornar identities vazio, significa que o e-mail já existia
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          error: new Error("Já existe uma conta cadastrada com este endereço de e-mail. Tente entrar ou recuperar sua senha."),
          user: null,
        };
      }

      if (data.user) {
        // Criação preventiva do perfil caso a trigger do banco não tenha sido executada
        try {
          await supabase.from("profiles").upsert({
            user_id: data.user.id,
            name: trimmedName,
            email: trimmedEmail,
          }, { onConflict: "user_id" });
        } catch {
          // Ignora caso a trigger já tenha feito
        }
      }

      return { error: null, user: data.user };
    } catch (err) {
      return { error: new Error(getFriendlyAuthErrorMessage(err)), user: null };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      if (error) {
        return { error: new Error(getFriendlyAuthErrorMessage(error)) };
      }
      return { error: null };
    } catch (err) {
      return { error: new Error(getFriendlyAuthErrorMessage(err)) };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth?mode=recovery`,
      });
      if (error) {
        return { error: new Error(getFriendlyAuthErrorMessage(error)) };
      }
      return { error: null };
    } catch (err) {
      return { error: new Error(getFriendlyAuthErrorMessage(err)) };
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        return { error: new Error(getFriendlyAuthErrorMessage(error)) };
      }
      return { error: null };
    } catch (err) {
      return { error: new Error(getFriendlyAuthErrorMessage(err)) };
    }
  }, []);

  const updateProfile = useCallback(async (patch: { name?: string; avatar_url?: string | null }) => {
    if (!user) {
      return { error: new Error("Usuário não autenticado.") };
    }
    try {
      const updates: { name?: string; avatar_url?: string | null; updated_at: string } = {
        updated_at: new Date().toISOString(),
      };
      if (patch.name !== undefined) updates.name = patch.name.trim();
      if (patch.avatar_url !== undefined) updates.avatar_url = patch.avatar_url;

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      await refreshProfile();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  }, [user, refreshProfile]);

  const deleteAccount = useCallback(async () => {
    if (!user) {
      return { error: new Error("Nenhum usuário logado.") };
    }
    try {
      const uid = user.id;

      // 1. Remover curtidas e salvos comunitários
      try {
        await supabase.from("community_likes").delete().eq("user_id", uid);
      } catch {
        // Ignora caso tabela não exista ou permissão
      }

      try {
        await supabase.from("community_bookmarks").delete().eq("user_id", uid);
      } catch {
        // Ignora
      }

      // 2. Remover comentários e posts
      try {
        await supabase.from("community_comments").delete().eq("user_id", uid);
      } catch {
        // Ignora
      }

      try {
        await supabase.from("community_posts").delete().eq("user_id", uid);
      } catch {
        // Ignora
      }

      // 3. Remover perfil
      try {
        await supabase.from("profiles").delete().eq("user_id", uid);
      } catch {
        // Ignora
      }

      // 4. Limpar dados locais sensíveis do usuário
      try {
        localStorage.removeItem("bible_reading_history");
        localStorage.removeItem("bible_reading_plan");
        localStorage.removeItem("verse_notifications");
        localStorage.removeItem("verse_last_notified");
      } catch {
        // Ignora
      }

      // 5. Encerrar sessão no Supabase
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Erro ao excluir a conta.") };
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
