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

export default function HomePage() {
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
          <Portfolio />
        </section>
        <section id="events" className="section-odd">
          <Events />
        </section>
        <section id="structure" className="section-even">
          <Structure />
        </section>
        <section id="gallery" className="section-odd">
          <Gallery />
        </section>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
