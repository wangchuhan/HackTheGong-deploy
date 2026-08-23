"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <div
      key={pathname}
      className="page-enter"
    >
      {children}
    </div>
  );
}
