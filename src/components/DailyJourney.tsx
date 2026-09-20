import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Sparkles, ArrowRight, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDailyJourney, JOURNEY_ACTIVITIES } from "@/lib/daily-journey";
import { Button } from "@/components/ui/button";

export function DailyJourney() {
  const { user } = useAuth();
  const { completed, completedCount, totalActivities, isCompleted, toggleActivity } = useDailyJourney(user?.id);

  const percentage = Math.round((completedCount / totalActivities) * 100);

  return (
    <section className="warm-panel rounded-2xl p-5 sm:p-7 border border-border/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
            <Sparkles className="size-3.5" /> Devocional & Prática Diária
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
            Minha Jornada de Hoje
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Quatro passos essenciais para alimentar sua fé e caminhar na presença de Deus.
          </p>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            Progresso:{" "}
            <span className="text-gold font-bold">
              {completedCount} de {totalActivities} concluídos
            </span>
          </span>
          <div className="w-32 sm:w-36 h-2 bg-muted rounded-full overflow-hidden mt-1.5 border border-border/50">
            <div
              className="h-full bg-gradient-to-r from-gold to-amber-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {isCompleted && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-300">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Trophy className="size-5 animate-bounce" />
          </div>
          <div>
            <p className="text-sm font-bold">
              Parabéns! Você concluiu sua jornada de hoje.
            </p>
            <p className="text-xs opacity-90">
              Que a graça e a paz do Senhor continuem guiando seus pensamentos e atitudes ao longo deste dia.
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {JOURNEY_ACTIVITIES.map((act) => {
          const done = Boolean(completed[act.id]);
          return (
            <div
              key={act.id}
              className={`group flex flex-col justify-between rounded-xl border p-4 transition-all ${
                done
                  ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
                  : "border-border bg-card hover:border-gold/50 hover:bg-accent/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-2xl select-none" aria-hidden="true">
                    {act.iconText}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleActivity(act.id)}
                    aria-label={done ? `Desmarcar ${act.title}` : `Marcar ${act.title} como concluído`}
                    className="flex items-center gap-1.5 text-xs font-medium cursor-pointer rounded-md p-1 hover:bg-accent transition-colors"
                  >
                    {done ? (
                      <>
                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950/40" />
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          Concluído
                        </span>
                      </>
                    ) : (
                      <>
                        <Circle className="size-5 text-muted-foreground/50 group-hover:text-gold transition-colors" />
                        <span className="text-[11px] text-muted-foreground group-hover:text-foreground">
                          Concluir
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <h3
                  className={`mt-2.5 font-display text-sm font-semibold transition-colors ${
                    done ? "text-foreground line-through opacity-80" : "text-foreground"
                  }`}
                >
                  {act.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-border/40">
                <Button
                  asChild
                  variant={done ? "outline" : "default"}
                  size="sm"
                  className="w-full text-xs h-8 justify-between font-medium"
                >
                  <Link to={act.link as any}>
                    <span>{done ? "Acessar novamente" : "Iniciar agora"}</span>
                    <ArrowRight className="size-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
