import { createContext, useContext, type ReactNode } from "react";
import { defaultAdSettings, type AdSettings } from "@/lib/ads-config";

const AdSettingsContext = createContext<AdSettings>(defaultAdSettings);

export function AdSettingsProvider({
  value,
  children,
}: {
  value: AdSettings;
  children: ReactNode;
}) {
  return <AdSettingsContext.Provider value={value}>{children}</AdSettingsContext.Provider>;
}

export function useAdSettings(): AdSettings {
  return useContext(AdSettingsContext);
}
