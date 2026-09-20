import { useState, useEffect } from "react";
import { Bell, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getNotificationPermission,
  hasDismissedPrompt,
  dismissPrompt,
  requestNotificationPermission,
  isPushNotificationSupported,
} from "@/lib/notifications";

export function NotificationPermissionBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isPushNotificationSupported()) return undefined;

    const perm = getNotificationPermission();
    // Only display prompt if not yet decided and user hasn't dismissed it
    if (perm === "default" && !hasDismissedPrompt()) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 2500); // 2.5s polite delay
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  if (!visible) return null;

  const handleAllow = async () => {
    setVisible(false);
    await requestNotificationPermission();
  };

  const handleDismiss = () => {
    setVisible(false);
    dismissPrompt();
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300 md:bottom-6 md:left-auto md:right-6">
      <div className="rounded-2xl border border-primary/20 bg-background/95 p-5 shadow-xl backdrop-blur-md dark:border-primary/30">
        <div className="flex items-start gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bell className="size-5 animate-pulse" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-gold" /> Receba uma palavra de fé todos os dias
              </h4>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground -mr-1 -mt-1 p-1 rounded-md"
                aria-label="Fechar"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Ative as notificações e receba um versículo pela manhã (08:00), à tarde (12:00) e à noite (20:00).
            </p>

            <div className="flex items-center gap-2 pt-2.5">
              <Button size="sm" onClick={handleAllow} className="h-8 text-xs font-semibold px-4">
                Ativar notificações
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8 text-xs text-muted-foreground">
                Agora não
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
