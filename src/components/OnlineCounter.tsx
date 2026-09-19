import { useGlobalOnlinePresence } from "@/lib/presence";
import { useAuth } from "@/lib/auth-context";

interface OnlineCounterProps {
  className?: string;
  showDetails?: boolean;
}

/**
 * Componente discreto e elegante de contagem de pessoas online em tempo real.
 * - Mobile: 🟢 25 online
 * - Desktop: 🟢 25 pessoas online agora
 */
export function OnlineCounter({ className = "", showDetails = false }: OnlineCounterProps) {
  const { user } = useAuth();
  const { totalOnline, authenticatedOnline, visitorsOnline, isConnected } = useGlobalOnlinePresence(user?.id);

  const peopleWord = totalOnline === 1 ? "pessoa" : "pessoas";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 select-none ${className}`}
      title={
        showDetails
          ? `Total: ${totalOnline} | Cadastrados: ${authenticatedOnline} | Visitantes: ${visitorsOnline}`
          : "Usuários ativos no site agora"
      }
    >
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>

      {/* Texto adaptativo para mobile e desktop */}
      <span className="sm:hidden font-semibold">
        {totalOnline} online
      </span>
      <span className="hidden sm:inline font-semibold">
        {totalOnline} {peopleWord} online agora
      </span>
    </div>
  );
}
