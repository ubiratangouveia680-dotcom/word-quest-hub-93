import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  username?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileParams {
  name?: string;
  username?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
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
  updateProfile: (patch: UpdateProfileParams) => Promise<{ error: Error | null }>;
  checkUsernameAvailable: (username: string) => Promise<{ available: boolean; message?: string }>;
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

export async function checkUsernameAvailable(
  rawUsername: string,
  currentUserId?: string
): Promise<{ available: boolean; message?: string }> {
  const clean = rawUsername.trim().toLowerCase().replace(/^@/, "");
  if (!clean) {
    return { available: false, message: "O nome de usuário não pode estar em branco." };
  }
  if (!/^[a-z0-9_]{3,20}$/.test(clean)) {
    return {
      available: false,
      message: "O nome de usuário deve ter entre 3 e 20 caracteres (somente letras minúsculas, números e underline).",
    };
  }

  try {
    let query = supabase.from("profiles").select("user_id").eq("username", clean);
    if (currentUserId) {
      query = query.neq("user_id", currentUserId);
    }
    const { data, error } = await query.maybeSingle();

    if (error && error.message?.includes("column profiles.username does not exist")) {
      return { available: true };
    }

    if (data) {
      return { available: false, message: "Este nome de usuário já está em uso por outro membro." };
    }

    return { available: true };
  } catch {
    return { available: true };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(
    async (userId: string, userEmail?: string, userMeta?: Record<string, any> | null) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.warn("Erro ao buscar perfil:", error.message);
        }

        const meta = userMeta || {};
        const metaName = meta["name"] || meta["full_name"] || null;
        const metaUsername = meta["username"] || null;
        const metaBio = meta["bio"] || null;
        let metaAvatar = meta["avatar_url"] || null;
        if (!metaAvatar && typeof window !== "undefined") {
          metaAvatar = localStorage.getItem(`bo:user_avatar_${userId}`);
        }

        if (data) {
          const row = data as any;
          setProfile({
            ...row,
            avatar_url: row.avatar_url ?? metaAvatar ?? null,
            username: row.username ?? metaUsername ?? null,
            bio: row.bio ?? metaBio ?? null,
          } as UserProfile);
        } else {
          // Se ainda não existir perfil (ex: trigger não disparado), cria perfil local/remoto
          const fallbackName = metaName ?? (userEmail ? (userEmail.split("@")[0] ?? "Usuário") : "Usuário");
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .upsert(
              {
                user_id: userId,
                email: userEmail || null,
                name: fallbackName,
                avatar_url: metaAvatar,
                ...(metaUsername ? { username: metaUsername } : {}),
                ...(metaBio ? { bio: metaBio } : {}),
              } as any,
              { onConflict: "user_id" }
            )
            .select("*")
            .maybeSingle();

          if (!insertError && newProfile) {
            const p = newProfile as any;
            setProfile({
              ...p,
              avatar_url: p.avatar_url ?? metaAvatar ?? null,
              username: p.username ?? metaUsername ?? null,
              bio: p.bio ?? metaBio ?? null,
            } as UserProfile);
          } else {
            setProfile({
              id: userId,
              user_id: userId,
              name: fallbackName,
              email: userEmail || null,
              avatar_url: metaAvatar,
              username: metaUsername,
              bio: metaBio,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error("Falha ao sincronizar perfil:", err);
      }
    },
    []
  );

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
          session.user.user_metadata
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
            currentSession.user.user_metadata
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
        user.user_metadata
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


  const checkUsernameAvailableCallback = useCallback(
    async (username: string) => {
      return checkUsernameAvailable(username, user?.id);
    },
    [user?.id]
  );

  const updateProfile = useCallback(
    async (patch: UpdateProfileParams) => {
      if (!user) {
        return { error: new Error("Usuário não autenticado.") };
      }
      try {
        const updates: {
          name?: string;
          username?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          updated_at: string;
        } = {
          updated_at: new Date().toISOString(),
        };

        if (patch.name !== undefined) updates.name = patch.name.trim();
        if (patch.avatar_url !== undefined) updates.avatar_url = patch.avatar_url;
        if (patch.bio !== undefined) updates.bio = patch.bio ? patch.bio.trim() : null;

        if (patch.username !== undefined) {
          const cleanUser = patch.username ? patch.username.trim().toLowerCase().replace(/^@/, "") : null;
          if (cleanUser) {
            const avail = await checkUsernameAvailable(cleanUser, user.id);
            if (!avail.available) {
              return { error: new Error(avail.message || "Nome de usuário indisponível.") };
            }
            updates.username = cleanUser;
          } else {
            updates.username = null;
          }
        }

        // 1. Sincronizar com Supabase Auth user_metadata (Persistência garantida e independente de schema)
        const metaUpdates: Record<string, any> = {};
        if (updates.name !== undefined) metaUpdates.name = updates.name;
        if (updates.username !== undefined) metaUpdates.username = updates.username;
        if (updates.bio !== undefined) metaUpdates.bio = updates.bio;
        if (updates.avatar_url !== undefined) metaUpdates.avatar_url = updates.avatar_url;

        if (Object.keys(metaUpdates).length > 0) {
          try {
            const { data: updatedAuthUser, error: authError } = await supabase.auth.updateUser({ data: metaUpdates });
            if (!authError && updatedAuthUser?.user) {
              setUser(updatedAuthUser.user);
            }
          } catch (authErr) {
            console.warn("Aviso ao atualizar metadados do Auth:", authErr);
          }
        }

        // 2. Salvar avatar em localStorage para carregamento instantâneo
        if (updates.avatar_url !== undefined && typeof window !== "undefined") {
          if (updates.avatar_url) {
            localStorage.setItem(`bo:user_avatar_${user.id}`, updates.avatar_url);
          } else {
            localStorage.removeItem(`bo:user_avatar_${user.id}`);
          }
        }

        // 3. Atualizar tabela profiles de forma tolerante a colunas ausentes
        try {
          const { error: dbError } = await supabase
            .from("profiles")
            .update(updates as any)
            .eq("user_id", user.id);

          if (dbError) {
            if (dbError.code === "23505") {
              return { error: new Error("Este nome de usuário já está em uso por outro membro.") };
            }
            // Se as colunas adicionais ainda não existirem no schema (42703), tenta atualizar campos básicos
            if (dbError.code === "42703" || dbError.message?.includes("column")) {
              const safeUpdates: any = { updated_at: updates.updated_at };
              if (updates.name !== undefined) safeUpdates.name = updates.name;
              await supabase.from("profiles").update(safeUpdates).eq("user_id", user.id);
            }
          }
        } catch (dbErr) {
          console.warn("Atualização na tabela profiles com fallback:", dbErr);
        }

        // 4. Atualizar imediatamente o estado do React para feedback visual instantâneo
        setProfile((prev) => {
          const base = prev || {
            id: user.id,
            user_id: user.id,
            name: updates.name || user.email?.split("@")[0] || "Usuário",
            email: user.email || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_seen_at: null,
          };
          return {
            ...base,
            ...(updates.name !== undefined ? { name: updates.name } : {}),
            ...(updates.username !== undefined ? { username: updates.username } : {}),
            ...(updates.bio !== undefined ? { bio: updates.bio } : {}),
            ...(updates.avatar_url !== undefined ? { avatar_url: updates.avatar_url } : {}),
          } as UserProfile;
        });

        await refreshProfile();
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err : new Error(String(err)) };
      }
    },
    [user, refreshProfile]
  );

  const deleteAccount = useCallback(async () => {
    if (!user) {
      return { error: new Error("Nenhum usuário logado.") };
    }
    try {
      const uid = user.id;

      // Os dados comunitários relacionados são removidos pelo banco em cascata.
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
    checkUsernameAvailable: checkUsernameAvailableCallback,
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
