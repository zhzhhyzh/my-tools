import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toolCategories, allTools } from "../toolsConfig";
import { getToolIcon } from "../components/ToolIcon";
import { FiArrowRight, FiZap, FiShield, FiGlobe } from "react-icons/fi";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.04 } },
};

// Category color mapping for dark theme
const categoryColors = {
  "Organize PDF": { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", icon: "from-blue-500 to-blue-600", glow: "group-hover:shadow-blue-500/20" },
  "Optimize PDF": { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: "from-emerald-500 to-emerald-600", glow: "group-hover:shadow-emerald-500/20" },
  "Convert PDF": { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", icon: "from-orange-500 to-orange-600", glow: "group-hover:shadow-orange-500/20" },
  "Edit PDF": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", icon: "from-purple-500 to-purple-600", glow: "group-hover:shadow-purple-500/20" },
  "PDF Security": { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", icon: "from-red-500 to-red-600", glow: "group-hover:shadow-red-500/20" },
  "PDF Intelligence": { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", icon: "from-cyan-500 to-cyan-600", glow: "group-hover:shadow-cyan-500/20" },
};

const stats = [
  { icon: <FiZap />, value: "25+", label: "PDF Tools" },
  { icon: <FiShield />, value: "100%", label: "Free & Open Source" },
  { icon: <FiGlobe />, value: "Local", label: "Processing" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient absolute inset-0" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-badge" />
              Open Source PDF Toolkit
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Every PDF tool
              <br />
              <span className="text-gradient">you'll ever need</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Merge, split, compress, convert, and secure your PDFs with{" "}
              <span className="text-white font-medium">{allTools.length} powerful tools</span>.
              All processing done locally. No uploads to third-party servers.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 md:gap-12">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-white mb-1">
                    <span className="text-indigo-400">{stat.icon}</span>
                    {stat.value}
                  </div>
                  <p className="text-xs md:text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Fade to content */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-950 to-transparent" />
      </section>

      {/* Bento Grid Tool Categories */}
      <section className="relative max-w-7xl mx-auto px-6 py-16">
        {toolCategories.map((category, catIdx) => {
          const colors = categoryColors[category.name] || categoryColors["Organize PDF"];
          return (
            <motion.div
              key={category.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={stagger}
              className="mb-16"
            >
              {/* Category Header */}
              <motion.div variants={fadeUp} custom={0} className="flex items-center gap-4 mb-8">
                <div className={`px-4 py-1.5 rounded-full ${colors.bg} ${colors.border} border`}>
                  <span className={`text-sm font-semibold ${colors.text}`}>{category.name}</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                <span className="text-xs text-gray-600">{category.tools.length} tools</span>
              </motion.div>

              {/* Bento Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {category.tools.map((tool, toolIdx) => (
                  <motion.div key={tool.id} variants={fadeUp} custom={toolIdx + 1}>
                    <Link
                      to={`/tool/${tool.id}`}
                      className={`bento-card group block bg-gray-900/50 border border-white/5 rounded-2xl p-5 h-full ${colors.glow} hover:shadow-lg`}
                    >
                      {/* Icon */}
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors.icon} text-white flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        {getToolIcon(tool.icon)}
                      </div>

                      {/* Text */}
                      <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-gradient transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {tool.desc}
                      </p>

                      {/* Arrow */}
                      <div className="mt-3 flex items-center gap-1 text-xs text-gray-600 group-hover:text-indigo-400 transition-colors">
                        <span>Use tool</span>
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="font-bold text-white">zhzhhyzh<span className="text-gradient ml-1">PDF</span></span>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            Free, open-source PDF tools. All processing done locally.
          </p>
          <p className="text-xs text-gray-700">
            Built with React, FastAPI & Python
          </p>
        </div>
      </footer>
    </div>
  );
}
