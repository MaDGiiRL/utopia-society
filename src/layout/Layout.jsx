// src/layout/Layout.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ClubAudioPlayer from "../components/ClubAudioPlayer";
import { Outlet, useLocation } from "react-router";

export default function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-dvh flex flex-col relative">
      <Navbar />

      <main className="flex-1 relative">
        <Outlet />

        {/* AUDIO + PLAYER SOLO SU ROTTE PUBBLICHE (non /admin) */}
        {!isAdminRoute && (
          <>
            {/* AUDIO ELEMENT (invisibile) */}
            <audio id="club-audio" src="/audio/track.mp3" preload="auto" />

            {/* PLAYER CUSTOM A SCOMPARSA */}
            <ClubAudioPlayer />
          </>
        )}
      </main>

      {!isAdminRoute && (
        <>
          <Footer />
        </>
      )}
    </div>
  );
}
