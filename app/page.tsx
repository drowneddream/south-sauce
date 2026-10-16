import { Footer } from "./shared/components/Footer/Footer";
import { Header } from "./shared/components/Header/Header";
import VinylPlayer from "./shared/components/VinylPlayer/VinylPlayer";

export default function Home() {
  return (
    <main className="flex flex-col h-svh">
      <Header />
      <VinylPlayer />
      <Footer />
    </main>
  );
}