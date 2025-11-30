import ScrollScene3D from "../components/ScrollScene3D";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import ContactSection from "../components/ContactSection";

function Home() {
  return (
    <div className="relative">
      {/* SFONDO 3D SCROLL-DRIVEN */}
      <ScrollScene3D />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.25),_transparent_60%)]" />
      {/* CONTENUTO SCROLLABILE SOPRA IL 3D */}
      <div className="relative z-10">
        <HeroSection />
        <AboutSection />
        <ContactSection />
      </div>
    </div>
  );
}

export default Home;
