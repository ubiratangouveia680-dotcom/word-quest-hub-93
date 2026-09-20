import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const KEY = "bo:cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      /* ignore */
    }
  }, []);

  if (!visible) return null;

  const decide = (value: "all" | "essential") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-[4.25rem] z-50 px-3 lg:bottom-4">
      <div className="mx-auto max-w-3xl surface p-3.5 sm:flex sm:items-center sm:gap-4 sm:p-4">
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Usamos cookies para melhorar sua experiência, medir audiência e exibir anúncios.
          Veja nossa{" "}
          <Link to="/cookies" className="underline hover:text-foreground">Política de Cookies</Link>{" "}
          e a{" "}
          <Link to="/privacidade" className="underline hover:text-foreground">Política de Privacidade</Link>.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-0 sm:flex">
          <Button size="sm" variant="outline" className="h-11 sm:h-8" onClick={() => decide("essential")}>
            Só essenciais
          </Button>
          <Button size="sm" className="h-11 sm:h-8" onClick={() => decide("all")}>Aceitar</Button>
        </div>
      </div>
    </div>
  );
}
