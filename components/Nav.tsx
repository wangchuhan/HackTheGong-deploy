import Link from "next/link";
import {
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
  { href: "/heatmap", label: "Heatmap", icon: Flame },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Nav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-teal-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-2 py-1 text-xs text-teal-800/70 transition hover:text-teal-600"
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        ))}
        <Link
          href="/leaderboard"
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-xs text-teal-800/70 transition hover:text-teal-600"
        >
          <Trophy className="h-5 w-5" />
          <span>Ranks</span>
        </Link>
      </div>
    </nav>
  );
}
