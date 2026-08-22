import type { ReactNode } from "react";

export default function CouncilLayout({ children }: { children: ReactNode }) {
  return <div data-council>{children}</div>;
}
