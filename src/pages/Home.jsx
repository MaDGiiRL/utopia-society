// src/pages/Home.jsx
import ScrollScene3D from "../components/ScrollScene3D";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import ContactSection from "../components/ContactSection";

function Home() {
  return (
    <div className="relative">
      {/* SFONDO 3D SCROLL-DRIVEN */}
      <ScrollScene3D />

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
