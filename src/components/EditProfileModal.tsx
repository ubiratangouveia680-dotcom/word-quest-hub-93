import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  User as UserIcon,
  AtSign,
} from "lucide-react";
import { useAuth, checkUsernameAvailable, type UserProfile } from "@/lib/auth-context";
import { validateAvatarFile, uploadUserAvatar } from "@/lib/avatar";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile | null;
}

const MAX_BIO_LENGTH = 160;

export function EditProfileModal({ open, onOpenChange, profile }: EditProfileModalProps) {
  const { user, updateProfile } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estados dos campos
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);

  // Estados da foto
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  // Validação do username
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameFeedback, setUsernameFeedback] = useState<{
    valid: boolean;
    message?: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar dados quando o modal abre
  useEffect(() => {
    if (open) {
      const initialName = profile?.name || user?.user_metadata?.["name"] || "";
      const initialUsername = profile?.username || user?.user_metadata?.["username"] || "";
      const initialBio = profile?.bio || user?.user_metadata?.["bio"] || "";
      const initialAvatar = profile?.avatar_url || user?.user_metadata?.["avatar_url"] || null;

      setName(initialName);
      setUsername(initialUsername);
      setBio(initialBio);
      setCurrentAvatarUrl(initialAvatar);
      setSelectedFile(null);
      setPreviewUrl(null);
      setRemoveAvatar(false);
      setUsernameFeedback(null);
    }
  }, [open, profile, user]);

  // Limpeza de URL de pré-visualização de imagem
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Verificação de disponibilidade de username (com debounce)
  useEffect(() => {
    const cleanUser = username.trim().toLowerCase().replace(/^@/, "");
    const initialUser = (profile?.username || user?.user_metadata?.["username"] || "").toLowerCase();

    if (!cleanUser) {
      setUsernameFeedback(null);
      return;
    }

    if (cleanUser === initialUser) {
      setUsernameFeedback({ valid: true });
      return;
    }

    if (!/^[a-z0-9_]{3,20}$/.test(cleanUser)) {
      setUsernameFeedback({
        valid: false,
        message: "3 a 20 caracteres (somente letras, números e underline)",
      });
      return;
    }

    let active = true;
    setIsCheckingUsername(true);

    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailable(cleanUser, user?.id);
        if (active) {
          setUsernameFeedback({
            valid: res.available,
            message: res.available ? "Nome de usuário disponível!" : res.message,
          });
        }
      } catch {
        if (active) {
          setUsernameFeedback({ valid: true });
        }
      } finally {
        if (active) setIsCheckingUsername(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [username, profile?.username, user?.id, user?.user_metadata]);

  // Manipulação de seleção de arquivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Arquivo de imagem inválido.");
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setRemoveAvatar(false);
  };

  const handleRemovePhoto = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Detecção de alterações
  const initialName = (profile?.name || user?.user_metadata?.["name"] || "").trim();
  const initialUsername = (profile?.username || user?.user_metadata?.["username"] || "").trim().toLowerCase();
  const initialBio = (profile?.bio || user?.user_metadata?.["bio"] || "").trim();
  const initialAvatar = profile?.avatar_url || user?.user_metadata?.["avatar_url"] || null;

  const currentCleanUser = username.trim().toLowerCase().replace(/^@/, "");

  const hasNameChanged = name.trim() !== initialName;
  const hasUsernameChanged = currentCleanUser !== initialUsername;
  const hasBioChanged = bio.trim() !== initialBio;
  const hasAvatarChanged = selectedFile !== null || (removeAvatar && initialAvatar !== null);

  const hasAnyChange = hasNameChanged || hasUsernameChanged || hasBioChanged || hasAvatarChanged;
  const isUsernameValid = !currentCleanUser || (usernameFeedback ? usernameFeedback.valid : true);
  const isFormValid = name.trim().length >= 2 && isUsernameValid && !isCheckingUsername;

  const canSave = hasAnyChange && isFormValid && !isSaving;

  // Imagem a ser exibida na pré-visualização
  const effectiveAvatarSrc = removeAvatar
    ? null
    : previewUrl || currentAvatarUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || !user) return;

    setIsSaving(true);
    const saveToastId = toast.loading("Salvando dados do seu perfil...");

    try {
      let finalAvatarUrl: string | null | undefined = undefined;

      // 1. Processar upload de nova foto se selecionada
      if (selectedFile) {
        try {
          const uploadRes = await uploadUserAvatar(user.id, selectedFile);
          finalAvatarUrl = uploadRes.avatarUrl;
        } catch (uploadErr) {
          toast.dismiss(saveToastId);
          toast.error(
            uploadErr instanceof Error
              ? uploadErr.message
              : "Erro ao realizar upload da foto de perfil. Tente uma imagem diferente."
          );
          setIsSaving(false);
          return;
        }
      } else if (removeAvatar) {
        finalAvatarUrl = null;
      }

      // 2. Salvar alterações no perfil
      const payload: {
        name?: string;
        username?: string | null;
        bio?: string | null;
        avatar_url?: string | null;
      } = {};

      if (hasNameChanged) payload.name = name.trim();
      if (hasUsernameChanged) payload.username = currentCleanUser || null;
      if (hasBioChanged) payload.bio = bio.trim() || null;
      if (finalAvatarUrl !== undefined) payload.avatar_url = finalAvatarUrl;

      const { error } = await updateProfile(payload);

      toast.dismiss(saveToastId);

      if (error) {
        toast.error(error.message || "Não foi possível atualizar o perfil.");
      } else {
        toast.success("Perfil atualizado com sucesso!");
        onOpenChange(false);
      }
    } catch (err) {
      toast.dismiss(saveToastId);
      toast.error(err instanceof Error ? err.message : "Ocorreu um erro ao salvar o perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-2xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
            <UserIcon className="size-5 text-gold" /> Editar Perfil
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Personalize suas informações públicas e foto de perfil na Bíblia Online.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* 1. SEÇÃO DA FOTO DE PERFIL */}
          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl bg-accent/30 p-4 border border-border/80">
            <div className="relative shrink-0">
              <div className="size-20 rounded-full border-2 border-primary/30 overflow-hidden bg-background shadow-sm flex items-center justify-center font-display font-bold text-2xl text-primary">
                {effectiveAvatarSrc ? (
                  <img
                    src={effectiveAvatarSrc}
                    alt={name || "Foto de perfil"}
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{(name || user?.email || "U").charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Botão de câmera sobreposto */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
                title="Escolher foto"
                aria-label="Escolher foto do dispositivo"
              >
                <Camera className="size-3.5" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <p className="text-xs font-semibold text-foreground">Foto de Perfil</p>
              <p className="text-[11px] text-muted-foreground">
                Formatos aceitos: JPG, PNG ou WEBP. A imagem é otimizada automaticamente.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-file-input"
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 text-xs font-medium"
                >
                  <Camera className="mr-1.5 size-3.5 text-primary" />
                  {effectiveAvatarSrc ? "Substituir foto" : "Selecionar foto"}
                </Button>

                {effectiveAvatarSrc && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="h-8 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-1.5 size-3.5" /> Remover foto
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 2. CAMPO NOME COMPLETO */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-profile-name" className="text-xs font-semibold flex items-center gap-1">
              Nome Completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como você deseja ser chamado(a)"
              maxLength={60}
              required
              className="h-10 text-sm"
            />
            {name.trim().length > 0 && name.trim().length < 2 && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertCircle className="size-3 shrink-0" /> O nome deve ter no mínimo 2 caracteres.
              </p>
            )}
          </div>

          {/* 3. CAMPO NOME DE USUÁRIO / @USERNAME */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-profile-username" className="text-xs font-semibold flex items-center gap-1">
                Nome de Usuário (@)
              </Label>
              {isCheckingUsername && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" /> Verificando...
                </span>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                <AtSign className="size-4" />
              </div>
              <Input
                id="edit-profile-username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="seu_usuario"
                maxLength={20}
                className="h-10 pl-8 text-sm font-mono"
              />
            </div>

            {usernameFeedback && (
              <p
                className={`text-[11px] flex items-center gap-1 mt-1 ${
                  usernameFeedback.valid ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                }`}
              >
                {usernameFeedback.valid ? (
                  <Check className="size-3 shrink-0" />
                ) : (
                  <AlertCircle className="size-3 shrink-0" />
                )}
                <span>{usernameFeedback.message || "Nome de usuário válido."}</span>
              </p>
            )}

            <p className="text-[11px] text-muted-foreground">
              Seu identificador único na Comunidade Palavra Viva. Letras minúsculas, números e underline.
            </p>
          </div>

          {/* 4. CAMPO BIOGRAFIA */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-profile-bio" className="text-xs font-semibold">
                Biografia
              </Label>
              <span
                className={`text-[11px] font-mono ${
                  bio.length > MAX_BIO_LENGTH * 0.9 ? "text-amber-500 font-bold" : "text-muted-foreground"
                }`}
              >
                {bio.length} / {MAX_BIO_LENGTH}
              </span>
            </div>

            <Textarea
              id="edit-profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
              placeholder="Compartilhe um versículo preferido ou uma breve reflexão sobre sua caminhada na fé..."
              rows={3}
              className="resize-none text-sm leading-relaxed"
            />
            <p className="text-[11px] text-muted-foreground">
              Aparecerá no topo do seu perfil e em suas publicações na comunidade.
            </p>
          </div>

          {/* RODAPÉ DO MODAL */}
          <DialogFooter className="flex flex-col-reverse sm:flex-row items-center gap-2 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="w-full sm:w-auto h-10 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!canSave}
              className="w-full sm:w-auto h-10 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Check className="size-3.5" /> Salvar alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
