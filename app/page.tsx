import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Division from '@/components/Division';
import Portfolio from '@/components/Portfolio';
import Events from '@/components/Events';
import Structure from '@/components/Structure';
import Gallery from '@/components/Gallery';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { getStructureListAsync } from '@/lib/data/structure-store';
import { getPortfoliosFromDb, getEventsFromDb, getGalleryPhotosFromDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [structureData, portfolioData, eventsData, galleryData] = await Promise.all([
    getStructureListAsync(),
    getPortfoliosFromDb(),
    getEventsFromDb(),
    getGalleryPhotosFromDb(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <section id="home" className="section-odd">
          <Hero />
        </section>
        <section id="about" className="section-even">
          <About />
        </section>
        <section id="division" className="section-odd">
          <Division />
        </section>
        <section id="portfolio" className="section-even">
          <Portfolio initialData={portfolioData} />
        </section>
        <section id="events" className="section-odd">
          <Events initialData={eventsData} />
        </section>
        <section id="structure" className="section-even">
          <Structure initialData={structureData} />
        </section>
        <section id="gallery" className="section-odd">
          <Gallery initialData={galleryData} />
        </section>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
