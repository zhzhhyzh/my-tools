import { motion } from "framer-motion";
import { FiDownload, FiMonitor, FiCpu, FiCheck, FiExternalLink, FiGithub } from "react-icons/fi";

const GITHUB_REPO = "zhzhhyzh/my-tools";
const LATEST_VERSION = "v1.0.0";

const platforms = [
  {
    id: "windows",
    name: "Windows",
    icon: <FiMonitor className="text-3xl" />,
    fileName: `pdf-tools-windows-${LATEST_VERSION}.zip`,
    downloadUrl: `https://github.com/${GITHUB_REPO}/releases/latest/download/pdf-tools-windows-${LATEST_VERSION}.zip`,
    arch: "x86_64",
    size: "~15 MB",
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/20",
    steps: [
      "Extract the downloaded .zip file",
      "Double-click install.bat (first time only)",
      "Double-click run.bat to start",
      "Opens automatically at http://localhost:3001",
    ],
  },
  {
    id: "mac",
    name: "Mac (AMD64)",
    icon: <FiCpu className="text-3xl" />,
    fileName: `pdf-tools-mac-amd64-${LATEST_VERSION}.tar.gz`,
    downloadUrl: `https://github.com/${GITHUB_REPO}/releases/latest/download/pdf-tools-mac-amd64-${LATEST_VERSION}.tar.gz`,
    arch: "AMD64 / Intel",
    size: "~15 MB",
    gradient: "from-purple-500 to-pink-500",
    glow: "shadow-purple-500/20",
    steps: [
      "Extract: tar -xzf pdf-tools-mac-amd64-*.tar.gz",
      "Run: chmod +x install.sh run.sh",
      "Run: ./install.sh (first time only)",
      "Run: ./run.sh to start",
    ],
  },
];

const prerequisites = [
  { name: "Node.js 18+", url: "https://nodejs.org/" },
  { name: "Python 3.8+", url: "https://www.python.org/downloads/" },
];

const optionalDeps = [
  { name: "LibreOffice", desc: "Office file conversions (Word, PPT, Excel)", url: "https://www.libreoffice.org/", letter: "L" },
  { name: "Poppler", desc: "PDF to image conversion", url: "https://poppler.freedesktop.org/", letter: "P" },
  { name: "Tesseract OCR", desc: "Make scanned PDFs searchable", url: "https://github.com/tesseract-ocr/tesseract", letter: "T" },
  { name: "wkhtmltopdf", desc: "HTML/URL to PDF conversion", url: "https://wkhtmltopdf.org/", letter: "W" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Download() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-6">
              <FiDownload className="text-indigo-400" />
              Desktop Application
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Download <span className="text-gradient">PDF Tools</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Run the full suite locally on your machine. Free, open-source, and offline-capable.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {platforms.map((p, i) => (
            <motion.div
              key={p.id}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={i}
              className={`bento-card bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col`}
            >
              {/* Card header */}
              <div className={`bg-gradient-to-r ${p.gradient} p-6 flex items-center gap-4 shimmer`}>
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  {p.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{p.name}</h2>
                  <p className="text-white/70 text-sm">{p.arch}</p>
                </div>
              </div>

              {/* Card body */}
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-5">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Quick Start
                  </h3>
                  <ol className="space-y-2.5">
                    {p.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-400">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/5 border border-white/10 text-gray-500 text-xs flex items-center justify-center font-medium mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs bg-gray-800/50 rounded-lg px-2 py-1 border border-white/5">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-auto">
                  <a
                    href={p.downloadUrl}
                    className={`w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r ${p.gradient} text-white font-semibold py-3.5 px-6 rounded-xl hover:shadow-lg ${p.glow} hover:scale-[1.01] active:scale-[0.99] transition-all`}
                  >
                    <FiDownload />
                    Download for {p.name}
                  </a>
                  <p className="text-xs text-gray-600 text-center mt-2">
                    {p.fileName} &middot; {p.size}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Prerequisites */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="bg-gray-900/50 rounded-2xl border border-white/5 p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-white mb-2">Prerequisites</h2>
          <p className="text-sm text-gray-500 mb-4">Must be installed before running PDF Tools:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prerequisites.map((dep) => (
              <a
                key={dep.name}
                href={dep.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 hover:border-emerald-500/30 transition-colors group"
              >
                <FiCheck className="text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white text-sm group-hover:text-emerald-400 transition-colors">{dep.name}</p>
                  <p className="text-xs text-emerald-500/70">Required</p>
                </div>
                <FiExternalLink className="ml-auto text-gray-600 group-hover:text-emerald-400 transition-colors" />
              </a>
            ))}
          </div>
        </motion.div>

        {/* Optional Dependencies */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
          className="bg-gray-900/50 rounded-2xl border border-white/5 p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-white mb-2">Optional Dependencies</h2>
          <p className="text-sm text-gray-500 mb-4">Install for full functionality. Core tools work without them.</p>
          <div className="space-y-2">
            {optionalDeps.map((dep) => (
              <a
                key={dep.name}
                href={dep.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/60 transition-colors group border border-transparent hover:border-white/5"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 border border-indigo-500/10">
                  {dep.letter}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white text-sm group-hover:text-indigo-400 transition-colors">{dep.name}</p>
                  <p className="text-xs text-gray-500">{dep.desc}</p>
                </div>
                <FiExternalLink className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
              </a>
            ))}
          </div>
        </motion.div>

        {/* Source Code */}
        <div className="text-center py-8">
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
          >
            <FiGithub />
            View Source on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
