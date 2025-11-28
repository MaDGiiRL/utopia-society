import { Routes, Route } from "react-router";
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import MembershipForm from "../pages/MembershipForm";

export default function Routing() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/ammissione-socio" element={<MembershipForm />} />
      </Route>
    </Routes>
  );
}
