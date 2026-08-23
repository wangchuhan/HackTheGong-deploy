import Link from "next/link";
import {
  Calendar,
  Camera,
  Flame,
  Home,
  MapPin,
  Trophy,
  User,
} from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/report", label: "Report", icon: Camera },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/heatmap", label: "Heat", icon: Flame },
  { href: "/leaderboard", label: "Ranks", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Nav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-teal-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-around px-0.5 py-1.5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-1 text-[9px] text-teal-800/70 transition hover:text-teal-600"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
