// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MembershipForm from "./pages/MembershipForm";
import { SpeedInsights } from "@vercel/speed-insights/next";
function App() {
  return (
    <Router>
      <SpeedInsights />
      <div className="min-h-screen w-full text-slate-50">
        <Navbar />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ammissione-socio" element={<MembershipForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
