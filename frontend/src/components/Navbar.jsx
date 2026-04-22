import { Link, useLocation } from "react-router-dom";
import { FiDownload, FiGrid } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isDownload = location.pathname === "/download";

  const links = [
    { to: "/", label: "All Tools", icon: <FiGrid />, active: isHome },
    { to: "/download", label: "Download", icon: <FiDownload />, active: isDownload },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            zhzhhyzh<span className="text-gradient ml-1">PDF</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative px-4 py-2 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              {link.active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-2 ${link.active ? "text-white" : "text-gray-400 hover:text-white"}`}>
                {link.icon}
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
