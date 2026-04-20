import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Download from "./pages/Download";
import ToolPage from "./components/ToolPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/download" element={<Download />} />
        <Route path="/tool/:toolId" element={<ToolPage />} />
      </Routes>
    </BrowserRouter>
  );
}
