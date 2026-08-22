import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-teal-100 bg-white/80 px-4 py-4 text-center text-xs text-teal-700/70">
      <p>
        VapeSafe · HackTheGong · Wollongong / Illawarra
      </p>
      <p className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link href="/news" className="underline hover:text-teal-600">
          News
        </Link>
        <a
          href="https://www.wollongong.nsw.gov.au/"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-teal-600"
        >
          Resources
        </a>
        <Link href="/council" className="text-teal-600/50 underline hover:text-teal-600">
          Partner login
        </Link>
      </p>
    </footer>
  );
}
