import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./Home";
import OurMission from "./OurMission";
import Impact from "./Impact";
import Stories from "./Stories";
import Transparency from "./Transparency";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="mission" element={<OurMission />} />
        <Route path="impact" element={<Impact />} />
        <Route path="stories" element={<Stories />} />
        <Route path="transparency" element={<Transparency />} />
      </Route>
    </Routes>
  );
}
