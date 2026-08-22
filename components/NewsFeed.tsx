import Link from "next/link";
import { Newspaper } from "lucide-react";
import type { NewsItem } from "@/lib/types";

interface NewsFeedProps {
  items: NewsItem[];
  limit?: number;
  showLink?: boolean;
}

function newsLink(item: NewsItem): string | undefined {
  if (item.type !== "news") return undefined;
  return item.url ?? item.homepageUrl;
}

export default function NewsFeed({ items, limit, showLink = true }: NewsFeedProps) {
  const display = limit ? items.slice(0, limit) : items;

  return (
    <div className="space-y-3">
      {display.map((item) => {
        const href = newsLink(item);
        return (
          <article
            key={item.id}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-teal-100"
          >
            <div className="flex items-start gap-2">
              <Newspaper className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
              <div className="flex-1">
                <p className="text-xs capitalize text-teal-600">{item.type}</p>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-teal-950 underline hover:text-teal-700"
                  >
                    {item.title}
                  </a>
                ) : item.type === "app" ? (
                  <Link
                    href={
                      item.title.toLowerCase().includes("schedule")
                        ? "/schedule"
                        : "/leaderboard"
                    }
                    className="font-medium text-teal-950 underline hover:text-teal-700"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <p className="font-medium text-teal-950">{item.title}</p>
                )}
                <p className="mt-1 text-sm text-teal-800/70">{item.summary}</p>
                {item.sourceOrg && item.homepageUrl && (
                  <a
                    href={item.homepageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs text-teal-600 hover:underline"
                  >
                    via {item.sourceOrg} →
                  </a>
                )}
                <p className="mt-1 text-xs text-teal-600/60">{item.date}</p>
              </div>
            </div>
          </article>
        );
      })}
      {showLink && limit && items.length > limit && (
        <Link
          href="/news"
          className="block text-center text-sm font-medium text-teal-600 underline"
        >
          View all news →
        </Link>
      )}
    </div>
  );
}
