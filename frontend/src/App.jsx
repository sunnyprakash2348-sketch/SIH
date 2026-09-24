import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewInspection from "./pages/NewInspection";
import Results from "./pages/Results";
import History from "./pages/History";
import Report from "./pages/Report";
import AnalyticsPage from "./pages/Analytics";
import RuleCatalog from "./pages/RuleCatalog";
import ConsumerScan from "./pages/ConsumerScan";

function loadOfficer() {
  try {
    return JSON.parse(localStorage.getItem("pccs_officer"));
  } catch {
    return null;
  }
}

export default function App() {
  const [officer, setOfficer] = useState(loadOfficer());

  function handleLogin(data) {
    localStorage.setItem("pccs_officer", JSON.stringify(data));
    setOfficer(data);
  }

  return (
    <Routes>
      <Route path="/scan" element={<ConsumerScan />} />
      <Route path="/login" element={officer ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />

      {officer ? (
        <>
          <Route path="/" element={<Layout officer={officer}><Dashboard /></Layout>} />
          <Route path="/inspect" element={<Layout officer={officer}><NewInspection officer={officer} /></Layout>} />
          <Route path="/results/:id" element={<Layout officer={officer}><Results /></Layout>} />
          <Route path="/history" element={<Layout officer={officer}><History /></Layout>} />
          <Route path="/report/:id" element={<Report />} />
          <Route path="/analytics" element={<Layout officer={officer}><AnalyticsPage /></Layout>} />
          <Route path="/rules" element={<Layout officer={officer}><RuleCatalog /></Layout>} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
}
