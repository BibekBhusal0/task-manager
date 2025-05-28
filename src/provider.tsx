import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ReactNode } from "react";


type ProviderProps = { children?: ReactNode }
export function Provider({ children }: ProviderProps) {

  return (
    <HeroUIProvider >
      <ToastProvider />
      {children}
    </HeroUIProvider>
  )
};
