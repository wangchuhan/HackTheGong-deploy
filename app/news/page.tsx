import { getNews } from "@/lib/data";
import NewsFeed from "@/components/NewsFeed";

export default function NewsPage() {
  const news = getNews();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-teal-950">News & Updates</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          Council updates, community wins, and tips for safe disposal
        </p>
        <p className="mt-2 rounded-lg bg-teal-50 px-3 py-2 text-xs text-teal-800">
          Resource links on the home page go to official org homepages. News
          items link to the latest updates — some article URLs may change over
          time; use the &quot;via …&quot; link for a stable homepage.
        </p>
      </header>
      <NewsFeed items={news} showLink={false} />
    </div>
  );
}
