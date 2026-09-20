import { supabase } from "@/integrations/supabase/client";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface AvatarValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida o arquivo de imagem selecionado pelo usuário.
 */
export function validateAvatarFile(file: File): AvatarValidationResult {
  if (!file) {
    return { valid: false, error: "Nenhum arquivo selecionado." };
  }

  const fileType = (file.type || "").toLowerCase();
  const fileName = (file.name || "").toLowerCase();
  const hasValidExt = /\.(jpe?g|png|webp)$/i.test(fileName);

  if (!ALLOWED_IMAGE_TYPES.includes(fileType) && !hasValidExt) {
    return {
      valid: false,
      error: "Formato inválido. Por favor, envie uma imagem nos formatos JPG, JPEG, PNG ou WEBP.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: "O tamanho do arquivo excede o limite máximo permitido de 10 MB.",
    };
  }

  return { valid: true };
}

export interface CompressedImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Comprime e redimensiona a imagem no navegador em formato quadrado 1:1
 * para evitar sobrecarga de rede e arquivos gigantescos.
 */
export async function compressAvatarImage(
  file: File,
  maxDimension = 256,
  quality = 0.75
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Falha ao ler o arquivo de imagem."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Não foi possível processar a imagem fornecida."));
      img.onload = () => {
        try {
          const originalWidth = img.naturalWidth || img.width;
          const originalHeight = img.naturalHeight || img.height;

          // Recorte central 1:1 quadrado
          const minSide = Math.min(originalWidth, originalHeight);
          const cropX = (originalWidth - minSide) / 2;
          const cropY = (originalHeight - minSide) / 2;

          const targetSize = Math.min(minSide, maxDimension);

          const canvas = document.createElement("canvas");
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Não foi possível inicializar o processador gráfico do navegador.");
          }

          // Qualidade de renderização alta
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          ctx.drawImage(
            img,
            cropX,
            cropY,
            minSide,
            minSide,
            0,
            0,
            targetSize,
            targetSize
          );

          // Tentar exportar como WebP, com fallback para JPEG
          let outputMime = "image/webp";
          let dataUrl = canvas.toDataURL(outputMime, quality);

          if (!dataUrl.startsWith("data:image/webp")) {
            outputMime = "image/jpeg";
            dataUrl = canvas.toDataURL(outputMime, quality);
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({
                  blob,
                  dataUrl,
                  width: targetSize,
                  height: targetSize,
                });
              } else {
                // Fallback a partir do DataURL
                const arr = dataUrl.split(",");
                const mime = arr[0]?.match(/:(.*?);/)?.[1] || outputMime;
                const bstr = atob(arr[1] || "");
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                  u8arr[n] = bstr.charCodeAt(n);
                }
                const fallbackBlob = new Blob([u8arr], { type: mime });
                resolve({
                  blob: fallbackBlob,
                  dataUrl,
                  width: targetSize,
                  height: targetSize,
                });
              }
            },
            outputMime,
            quality
          );
        } catch (err) {
          reject(err);
        }
      };

      img.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Remove o arquivo de avatar antigo do usuário no Supabase Storage, se existente.
 */
export async function deleteUserAvatar(
  userId: string,
  currentAvatarUrl?: string | null
): Promise<void> {
  if (!userId) return;

  try {
    const { data: listData, error: listError } = await supabase.storage
      .from("avatars")
      .list(userId);

    if (!listError && listData && listData.length > 0) {
      const filesToDelete = listData.map((file) => `${userId}/${file.name}`);
      const { error: removeError } = await supabase.storage
        .from("avatars")
        .remove(filesToDelete);

      if (removeError) {
        console.warn("Aviso ao remover arquivos do storage:", removeError.message);
      }
    }
  } catch (err) {
    console.warn("Aviso ao tentar excluir avatar do Storage:", err);
  }
}

/**
 * Realiza o upload do avatar do usuário para o Supabase Storage
 * com fallback inteligente para DataURL otimizado caso o bucket ainda
 * não esteja provisionado na infraestrutura.
 */
export async function uploadUserAvatar(
  userId: string,
  file: File
): Promise<{ avatarUrl: string; isStorage: boolean }> {
  const validation = validateAvatarFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "Arquivo de imagem inválido.");
  }

  // 1. Comprimir e otimizar localmente em 256x256 (~12KB a 18KB)
  const compressed = await compressAvatarImage(file, 256, 0.8);

  // 2. Limpar foto anterior do usuário no storage para evitar acúmulo de lixo
  await deleteUserAvatar(userId);

  // 3. Tentar upload no Supabase Storage
  try {
    const fileExt = compressed.blob.type === "image/webp" ? "webp" : "jpg";
    const filePath = `${userId}/avatar_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, compressed.blob, {
        upsert: true,
        contentType: compressed.blob.type,
      });

    if (!uploadError) {
      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (publicData?.publicUrl) {
        const publicUrlWithTimestamp = `${publicData.publicUrl}?t=${Date.now()}`;
        return { avatarUrl: publicUrlWithTimestamp, isStorage: true };
      }
    } else {
      console.warn("Supabase Storage retornou aviso no upload:", uploadError.message);
    }
  } catch (err) {
    console.warn("Upload no Supabase Storage indisponível, utilizando fallback em DataURL:", err);
  }

  // 4. Fallback ultra-resiliente: a imagem compactada é gravada diretamente como dataUrl
  return { avatarUrl: compressed.dataUrl, isStorage: false };
}

