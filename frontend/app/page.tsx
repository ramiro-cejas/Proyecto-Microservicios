import MovieGrid from "@/components/MovieGrid";
import Recommendation from "@/components/Recommendation";

export default async function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Recommendation />
      <MovieGrid />
    </main>
  );
}
