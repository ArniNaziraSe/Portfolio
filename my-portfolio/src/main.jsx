import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import './index.css'
import { ContactProvider } from "./context/ContactContext.jsx";
import ContactDetail from "./components/ContactDetail.jsx";
import Home from './pages/Home.jsx'
import ProjectDetail from "./pages/ProjectDetail.jsx";
import AdminDashboard from './pages/AdminDashboard.jsx';
import useTrackVisit from "./hooks/useTrackVisit";

// Wrapper kecil — biar bisa panggil hook (useTrackVisit) di dalam React tree.
// Hook gak bisa dipanggil di top level file (di luar component).
function AppRoutes() {
  useTrackVisit();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects/:slug" element={<ProjectDetail />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ContactProvider>
        <ContactDetail />
        <AppRoutes />
      </ContactProvider>
    </BrowserRouter>
  </StrictMode>,
)