import { Link } from "react-router-dom";
import { toolCategories } from "../toolsConfig";
import { getToolIcon } from "../components/ToolIcon";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-3">Every PDF Tool You Need</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Merge, split, compress, convert, rotate, unlock and
            watermark PDFs with just a few clicks. All 100% free.
          </p>
        </div>
      </div>

      {/* Tool Categories */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {toolCategories.map((category) => (
          <div key={category.name} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span
                className={`w-2 h-8 rounded-full bg-gradient-to-b ${category.color}`}
              />
              {category.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {category.tools.map((tool) => (
                <Link
                  key={tool.id}
                  to={`/tool/${tool.id}`}
                  className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200 hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} text-white flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform`}
                  >
                    {getToolIcon(tool.icon)}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-500 leading-snug">
                    {tool.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm">
        <div className="max-w-6xl mx-auto px-4">
          <p className="font-medium text-white mb-2">PDF Tools</p>
          <p>Free, open-source PDF tools. All processing done locally.</p>
        </div>
      </footer>
    </div>
  );
}
