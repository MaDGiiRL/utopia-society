import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {  Outlet } from "react-router";

export default function Layout() {

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}