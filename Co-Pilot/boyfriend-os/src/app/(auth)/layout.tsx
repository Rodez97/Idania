import type { ReactNode } from "react";
import { Providers } from "@/components/providers";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 px-4">
        {children}
      </div>
    </Providers>
  );
}
