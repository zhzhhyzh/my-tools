import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ToolPage from "./components/ToolPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tool/:toolId" element={<ToolPage />} />
      </Routes>
    </BrowserRouter>
  );
}
