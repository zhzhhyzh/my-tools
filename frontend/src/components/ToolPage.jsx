import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { getToolById } from "../toolsConfig";
import { getToolIcon } from "./ToolIcon";
import {
  FiUploadCloud,
  FiFile,
  FiX,
  FiDownload,
  FiArrowLeft,
  FiLoader,
} from "react-icons/fi";

export default function ToolPage() {
  const { toolId } = useParams();
  const tool = getToolById(toolId);
  const [files, setFiles] = useState([]);
  const [fields, setFields] = useState(() => {
    const init = {};
    tool?.fields?.forEach((f) => {
      init[f.name] = f.default || "";
    });
    return init;
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [compareResult, setCompareResult] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const maxFiles = tool?.maxFiles || (tool?.multiple ? 50 : 1);
      if (!tool?.multiple) {
        setFiles(acceptedFiles.slice(0, 1));
      } else {
        setFiles((prev) => [...prev, ...acceptedFiles].slice(0, maxFiles));
      }
    },
    [tool]
  );

  const acceptMap = {};
  if (tool?.accept) {
    tool.accept.split(",").forEach((ext) => {
      const mime =
        {
          ".pdf": "application/pdf",
          ".doc": "application/msword",
          ".docx":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ".ppt": "application/vnd.ms-powerpoint",
          ".pptx":
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          ".xls": "application/vnd.ms-excel",
          ".xlsx":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".bmp": "image/bmp",
          ".webp": "image/webp",
        }[ext.trim()] || "";
      if (mime) acceptMap[mime] = [ext.trim()];
    });
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.keys(acceptMap).length > 0 ? acceptMap : undefined,
    multiple: tool?.multiple || false,
    disabled: tool?.noFile,
  });

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (name, value) => {
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleProcess = async () => {
    if (!tool) return;
    setProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);
    setCompareResult(null);

    try {
      const formData = new FormData();

      if (tool.noFile) {
        // No file upload (e.g., HTML to PDF)
      } else if (tool.multiple) {
        files.forEach((f) => formData.append("files", f));
      } else if (files[0]) {
        formData.append("file", files[0]);
      }

      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      const isCompare = tool.id === "compare";

      const response = await axios.post(tool.endpoint, formData, {
        responseType: isCompare ? "json" : "blob",
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (isCompare) {
        setCompareResult(response.data);
      } else {
        const contentDisposition =
          response.headers["content-disposition"] || "";
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        const filename = filenameMatch
          ? filenameMatch[1]
          : `result.${getExtension(response.headers["content-type"])}`;

        const url = window.URL.createObjectURL(new Blob([response.data]));
        setResult({ url, filename: filename.replace(/"/g, "") });
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || err.message || "Processing failed"
      );
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };

  const getExtension = (contentType) => {
    const map = {
      "application/pdf": "pdf",
      "application/zip": "zip",
      "image/jpeg": "jpg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "pptx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "xlsx",
    };
    return map[contentType] || "pdf";
  };

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Tool not found
          </h2>
          <Link to="/" className="text-indigo-400 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const canProcess = tool.noFile
    ? tool.fields.some((f) => f.required && fields[f.name])
    : files.length > 0;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent" />
        <div className="relative max-w-3xl mx-auto px-6 py-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors"
          >
            <FiArrowLeft /> Back to all tools
          </Link>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.categoryColor} text-white flex items-center justify-center text-2xl shadow-lg`}>
              {getToolIcon(tool.icon)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{tool.name}</h1>
              <p className="text-gray-400 mt-1">{tool.desc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* File Upload Zone */}
        {!tool.noFile && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 mb-6 ${
              isDragActive
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-white/10 bg-gray-900/50 hover:border-indigo-500/50 hover:bg-indigo-500/5"
            }`}
          >
            <input {...getInputProps()} />
            <FiUploadCloud className="mx-auto text-4xl text-gray-500 mb-3" />
            <p className="text-lg text-gray-300 font-medium">
              {isDragActive
                ? "Drop files here..."
                : `Drag & drop ${tool.multiple ? "files" : "a file"} here, or click to browse`}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Accepted: {tool.accept}
              {tool.multiple && " (multiple files)"}
            </p>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-gray-900/50 rounded-2xl border border-white/5 p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Selected Files ({files.length})
            </h3>
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <FiFile className="text-gray-500" />
                    <span className="text-sm text-gray-300 truncate max-w-xs">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tool Options */}
        {tool.fields.length > 0 && (
          <div className="bg-gray-900/50 rounded-2xl border border-white/5 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tool.fields.map((field) => (
                <div
                  key={field.name}
                  className={field.textarea ? "md:col-span-2" : ""}
                >
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    {field.label}
                    {field.required && (
                      <span className="text-red-400 ml-1">*</span>
                    )}
                  </label>
                  {field.type === "select" ? (
                    <select
                      value={fields[field.name] || field.default || ""}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
                      className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.textarea ? (
                    <textarea
                      value={fields[field.name] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono placeholder-gray-600"
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={fields[field.name] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
                      placeholder={field.placeholder}
                      className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-gray-600"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process Button */}
        <button
          onClick={handleProcess}
          disabled={!canProcess || processing}
          className={`w-full py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
            canProcess && !processing
              ? "bg-gradient-to-r from-indigo-500 to-pink-500 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99]"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          {processing ? (
            <>
              <FiLoader className="animate-spin" />
              Processing... {progress > 0 && progress < 100 && `${progress}%`}
            </>
          ) : (
            `Process ${tool.name}`
          )}
        </button>

        {/* Progress Bar */}
        {processing && (
          <div className="mt-4 bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(progress, 10)}%` }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Download Result */}
        {result && (
          <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
            <p className="text-emerald-400 font-medium mb-3">
              Processing complete!
            </p>
            <a
              href={result.url}
              download={result.filename}
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors font-medium"
            >
              <FiDownload />
              Download {result.filename}
            </a>
          </div>
        )}

        {/* Compare Result */}
        {compareResult && (
          <div className="mt-6 bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Comparison Result</h3>
            {compareResult.identical ? (
              <p className="text-emerald-400 font-medium">
                The two PDFs are identical!
              </p>
            ) : (
              <div>
                <p className="text-orange-400 font-medium mb-3">
                  Differences found on{" "}
                  {compareResult.differences?.length || 0} page(s)
                </p>
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {compareResult.differences?.map((diff, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                      <p className="font-medium text-sm text-white mb-2">
                        Page {diff.page}
                      </p>
                      {diff.differences?.slice(0, 10).map((d, j) => (
                        <div
                          key={j}
                          className="text-xs grid grid-cols-2 gap-2 mb-1"
                        >
                          <div className="bg-red-500/10 p-2 rounded-lg">
                            <span className="text-red-400">File 1 L{d.line}:</span>{" "}
                            <span className="text-gray-300">{d.file1}</span>
                          </div>
                          <div className="bg-emerald-500/10 p-2 rounded-lg">
                            <span className="text-emerald-400">File 2 L{d.line}:</span>{" "}
                            <span className="text-gray-300">{d.file2}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
