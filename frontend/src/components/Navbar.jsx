import { Link, useLocation } from "react-router-dom";
import { FiDownload } from "react-icons/fi";

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="bg-gradient-to-r from-red-600 via-red-600 to-orange-500 text-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          PDF Tools
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isHome ? "bg-white/20" : "hover:bg-white/10"
            }`}
          >
            All Tools
          </Link>
          <Link
            to="/download"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
              location.pathname === "/download"
                ? "bg-white/20"
                : "hover:bg-white/10"
            }`}
          >
            <FiDownload className="text-base" />
            Download
          </Link>
        </div>
      </div>
    </nav>
  );
}
