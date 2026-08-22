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
      </header>
      <NewsFeed items={news} showLink={false} />
    </div>
  );
}
