import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  nextUrl?: string;
  icon?: React.ReactNode;
}

export function AuthPromptModal({
  open,
  onOpenChange,
  title = "Crie sua conta gratuita",
  description = "Para participar e interagir na comunidade da Bíblia Online, você precisa criar uma conta gratuita ou entrar.",
  nextUrl,
  icon,
}: AuthPromptModalProps) {
  const currentPath =
    typeof window !== "undefined"
      ? nextUrl || window.location.pathname + window.location.search + window.location.hash
      : nextUrl || "/";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
          {icon || "✨"}
        </div>

        <DialogHeader className="space-y-2">
          <DialogTitle className="font-display text-xl sm:text-2xl text-center font-bold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto font-bold bg-primary text-primary-foreground shadow-sm">
            <Link
              to="/auth"
              search={{ mode: "signup", next: currentPath }}
              onClick={() => onOpenChange(false)}
            >
              Criar minha conta
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-medium">
            <Link
              to="/auth"
              search={{ mode: "signin", next: currentPath }}
              onClick={() => onOpenChange(false)}
            >
              Entrar
            </Link>
          </Button>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground/80">
          A leitura da Bíblia continua 100% aberta e livre para todos os visitantes.
        </p>
      </DialogContent>
    </Dialog>
  );
}
