"use client";

import { usePathname } from "next/navigation";
import Nav from "./Nav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCouncil = pathname.startsWith("/council");

  return (
    <div className={isCouncil ? "flex min-h-full flex-1 flex-col" : "flex min-h-full flex-1 flex-col pb-20"}>
      <main
        className={`mx-auto w-full flex-1 ${
          isCouncil ? "max-w-none px-4 py-4" : "max-w-lg px-4 py-4"
        }`}
      >
        {children}
      </main>
      {!isCouncil && <Nav />}
    </div>
  );
}
