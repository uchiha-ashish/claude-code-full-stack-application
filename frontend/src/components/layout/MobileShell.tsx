import { ReactNode } from "react";

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex justify-center bg-ink-100">
      <main className="w-full max-w-mobile bg-brand-bg min-h-screen flex flex-col">{children}</main>
    </div>
  );
}
