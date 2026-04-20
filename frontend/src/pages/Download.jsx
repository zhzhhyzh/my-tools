import { Link } from "react-router-dom";
import { FiDownload, FiMonitor, FiCpu, FiCheck, FiArrowLeft } from "react-icons/fi";

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
    color: "from-blue-500 to-blue-600",
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
    color: "from-gray-700 to-gray-800",
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
  { name: "LibreOffice", desc: "Office file conversions (Word, PPT, Excel)", url: "https://www.libreoffice.org/" },
  { name: "Poppler", desc: "PDF to image conversion", url: "https://poppler.freedesktop.org/" },
  { name: "Tesseract OCR", desc: "Make scanned PDFs searchable", url: "https://github.com/tesseract-ocr/tesseract" },
  { name: "wkhtmltopdf", desc: "HTML/URL to PDF conversion", url: "https://wkhtmltopdf.org/" },
];

export default function Download() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-500 text-white py-10 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Download PDF Tools</h1>
        <p className="text-base text-white/90 max-w-xl mx-auto">
          Get the full PDF Tools suite running locally on your machine. Free and
          open-source.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {platforms.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Card header */}
              <div
                className={`bg-gradient-to-r ${p.color} text-white p-6 flex items-center gap-4`}
              >
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
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
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Quick Start
                  </h3>
                  <ol className="space-y-2">
                    {p.steps.map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-medium mt-0.5">
                          {i + 1}
                        </span>
                        <span className="font-mono text-xs bg-gray-50 rounded px-1.5 py-0.5">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-auto">
                  <a
                    href={p.downloadUrl}
                    className={`w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r ${p.color} text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all`}
                  >
                    <FiDownload />
                    Download for {p.name}
                  </a>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    {p.fileName} &middot; {p.size}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Prerequisites */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Prerequisites
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            These must be installed before running PDF Tools:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prerequisites.map((dep) => (
              <a
                key={dep.name}
                href={dep.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-4 hover:border-green-300 transition-colors"
              >
                <FiCheck className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {dep.name}
                  </p>
                  <p className="text-xs text-green-600">Required</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Optional Dependencies */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Optional Dependencies
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Install these for full functionality. The core tools work without
            them.
          </p>
          <div className="space-y-3">
            {optionalDeps.map((dep) => (
              <a
                key={dep.name}
                href={dep.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {dep.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {dep.name}
                  </p>
                  <p className="text-xs text-gray-500">{dep.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Source Code */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 mb-2">
            Want to build from source?
          </p>
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:text-red-700 font-medium text-sm hover:underline"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
