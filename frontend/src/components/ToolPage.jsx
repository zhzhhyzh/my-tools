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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Tool not found
          </h2>
          <Link to="/" className="text-blue-500 hover:underline">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${tool.categoryColor} text-white py-8 px-4`}
      >
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm"
          >
            <FiArrowLeft /> Back to all tools
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              {getToolIcon(tool.icon)}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{tool.name}</h1>
              <p className="text-white/80 mt-1">{tool.desc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* File Upload Zone */}
        {!tool.noFile && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 mb-6 ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50"
            }`}
          >
            <input {...getInputProps()} />
            <FiUploadCloud className="mx-auto text-4xl text-gray-400 mb-3" />
            <p className="text-lg text-gray-600 font-medium">
              {isDragActive
                ? "Drop files here..."
                : `Drag & drop ${tool.multiple ? "files" : "a file"} here, or click to browse`}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Accepted: {tool.accept}
              {tool.multiple && " (multiple files)"}
            </p>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Selected Files ({files.length})
            </h3>
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2"
                >
                  <div className="flex items-center gap-3">
                    <FiFile className="text-gray-400" />
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="text-gray-400 hover:text-red-500"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tool.fields.map((field) => (
                <div
                  key={field.name}
                  className={field.textarea ? "md:col-span-2" : ""}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {field.type === "select" ? (
                    <select
                      value={fields[field.name] || field.default || ""}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={fields[field.name] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
                      placeholder={field.placeholder}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
          className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
            canProcess && !processing
              ? `bg-gradient-to-r ${tool.categoryColor} hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]`
              : "bg-gray-300 cursor-not-allowed"
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
          <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${tool.categoryColor} transition-all duration-300 rounded-full`}
              style={{ width: `${Math.max(progress, 10)}%` }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Download Result */}
        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-700 font-medium mb-3">
              Processing complete!
            </p>
            <a
              href={result.url}
              download={result.filename}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <FiDownload />
              Download {result.filename}
            </a>
          </div>
        )}

        {/* Compare Result */}
        {compareResult && (
          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Comparison Result</h3>
            {compareResult.identical ? (
              <p className="text-green-600 font-medium">
                The two PDFs are identical!
              </p>
            ) : (
              <div>
                <p className="text-orange-600 font-medium mb-3">
                  Differences found on{" "}
                  {compareResult.differences?.length || 0} page(s)
                </p>
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {compareResult.differences?.map((diff, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-sm mb-2">
                        Page {diff.page}
                      </p>
                      {diff.differences?.slice(0, 10).map((d, j) => (
                        <div
                          key={j}
                          className="text-xs grid grid-cols-2 gap-2 mb-1"
                        >
                          <div className="bg-red-50 p-2 rounded">
                            <span className="text-red-600">File 1 L{d.line}:</span>{" "}
                            {d.file1}
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <span className="text-green-600">File 2 L{d.line}:</span>{" "}
                            {d.file2}
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
