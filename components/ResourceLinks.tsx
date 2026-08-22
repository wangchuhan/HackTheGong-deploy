import { ExternalLink } from "lucide-react";

const LINKS = [
  {
    title: "Wollongong City Council",
    href: "https://www.wollongong.nsw.gov.au/",
    desc: "Local waste services & community programs",
  },
  {
    title: "EPA NSW — Recycling",
    href: "https://www.epa.nsw.gov.au/your-environment/recycling",
    desc: "Safe disposal of batteries & e-waste",
  },
  {
    title: "NSW Government — Environment",
    href: "https://www.nsw.gov.au/environment",
    desc: "State environment initiatives",
  },
];

export default function ResourceLinks() {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-teal-100">
      <h2 className="font-semibold text-teal-950">Learn more</h2>
      <p className="mt-1 text-xs text-teal-700/70">
        Official resources for vape litter and e-waste in NSW
      </p>
      <ul className="mt-3 space-y-2">
        {LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2 rounded-lg p-2 text-sm hover:bg-teal-50"
            >
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
              <div>
                <p className="font-medium text-teal-900">{link.title}</p>
                <p className="text-xs text-teal-700/70">{link.desc}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
