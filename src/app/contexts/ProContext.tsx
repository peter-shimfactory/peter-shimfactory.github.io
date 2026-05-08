import { createContext, useContext, useState } from "react";

interface ProContextValue {
  isPro: boolean;
  setIsPro: (v: boolean) => void;
}

const ProContext = createContext<ProContextValue>({
  isPro: false,
  setIsPro: () => {},
});

export function ProProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  return (
    <ProContext.Provider value={{ isPro, setIsPro }}>
      {children}
    </ProContext.Provider>
  );
}

export function useProContext() {
  return useContext(ProContext);
}
