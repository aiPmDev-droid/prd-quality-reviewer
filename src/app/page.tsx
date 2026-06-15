"use client";

import { useState, useCallback, useRef } from "react";
import type { ReviewResponse } from "@/lib/types";
import type { SupportedFormat } from "@/lib/extractor";
import { getFormat } from "@/lib/extractor";

type Status = "idle" | "loading" | "success" | "error";

export default function HomePage() {
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileFormat, setFileFormat] = useState<SupportedFormat | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paste text state
  const [prdText, setPrdText] = useState("");

  // Result state
  const [result, setResult] = useState<ReviewResponse | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [extractedText, setExtractedText] = useState("");

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      const format = getFormat(selectedFile.name);
      if (!format) {
        setErrorMessage("Unsupported file format. Please upload .pdf, .docx, or .md files.");
        setFile(null);
        setFileName("");
        setFileFormat(null);
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileFormat(format);
      setErrorMessage("");
      setExtractedText("");
    },
    []
  );

  const readFileContent = useCallback(
    async (f: File, format: SupportedFormat): Promise<string> => {
      const buffer = await f.arrayBuffer();
      // Dynamic import to avoid bundling pdfjs-dist / mammoth during SSR
      const { extractTextFromPDF, extractTextFromDOCX, extractTextFromMD } = await import("@/lib/extractor");

      switch (format) {
        case "pdf":
          return await extractTextFromPDF(buffer);
        case "docx":
          return await extractTextFromDOCX(buffer);
        case "md":
          const text = new TextDecoder().decode(buffer);
          return await extractTextFromMD(text);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    },
    []
  );

  const handleReview = useCallback(async () => {
    let textToReview = "";

    if (inputMode === "upload") {
      if (!file || !fileFormat) {
        setErrorMessage("Please upload a .pdf, .docx, or .md file first.");
        return;
      }

      setStatus("loading");
      setErrorMessage("");

      try {
        textToReview = await readFileContent(file, fileFormat);
        setExtractedText(textToReview);
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          `Failed to read file: ${err instanceof Error ? err.message : "Unknown error"}`
        );
        return;
      }
    } else {
      // Paste mode
      textToReview = prdText.trim();
      if (textToReview.length < 50) {
        setErrorMessage(
          "Please paste a complete PRD (at least 50 characters)."
        );
        return;
      }
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prdText: textToReview }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      setResult(data as ReviewResponse);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }, [inputMode, file, fileFormat, prdText, readFileContent]);

  const resetForm = () => {
    setFile(null);
    setFileName("");
    setFileFormat(null);
    setPrdText("");
    setResult(null);
    setStatus("idle");
    setErrorMessage("");
    setExtractedText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          PRD Quality Reviewer
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Upload a PRD document or paste text — get scored against the SMART
          framework.
        </p>
      </header>

      {/* Mode Toggle */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1">
          <button
            onClick={() => {
              setInputMode("upload");
              setErrorMessage("");
            }}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              inputMode === "upload"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Upload Document
          </button>
          <button
            onClick={() => {
              setInputMode("paste");
              setErrorMessage("");
            }}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              inputMode === "paste"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Paste PRD Content
          </button>
        </div>
      </div>

      {/* Input Section */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {inputMode === "upload" ? (
          <>
            {/* File Upload Area */}
            <div
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition cursor-pointer ${
                file
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 bg-gray-50 hover:border-blue-400"
              }`}
              onClick={() => !file && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) {
                  const format = getFormat(droppedFile.name);
                  if (!format) {
                    setErrorMessage(
                      "Unsupported file format. Please upload .pdf, .docx, or .md files."
                    );
                    return;
                  }
                  setFile(droppedFile);
                  setFileName(droppedFile.name);
                  setFileFormat(format);
                  setErrorMessage("");
                  setExtractedText("");
                }
              }}
            >
              {file ? (
                <div className="space-y-2">
                  <div className="text-3xl">📄</div>
                  <p className="font-medium text-gray-800">{fileName}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB ·{" "}
                    {fileFormat?.toUpperCase()}
                  </p>
                  <button
                    onClick={() => {
                      setFile(null);
                      setFileName("");
                      setFileFormat(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-sm text-red-500 hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-4xl text-gray-300 mb-3">📂</div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600 cursor-pointer hover:text-blue-800">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    PDF, DOCX, or Markdown (.md)
                  </p>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.md"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {extractedText && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Preview extracted text ({extractedText.split(" ").length} words)
                </summary>
                <pre className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 whitespace-pre-wrap">
                  {extractedText.slice(0, 2000)}
                  {extractedText.length > 2000 ? "..." : ""}
                </pre>
              </details>
            )}
          </>
        ) : (
          <>
            {/* Paste Text Area */}
            <label
              htmlFor="prd-input"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Paste your PRD content
            </label>
            <textarea
              id="prd-input"
              rows={14}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm font-mono text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder={`Paste your PRD text here...\n\nExample: A PRD describing a new feature, including goals, metrics, user stories, acceptance criteria, and timeline.`}
              value={prdText}
              onChange={(e) => setPrdText(e.target.value)}
              disabled={status === "loading"}
            />
            <p className="mt-1 text-xs text-gray-400">
              At least 50 characters required
            </p>
          </>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleReview}
            disabled={status === "loading"}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Reviewing...
              </span>
            ) : (
              "Review PRD"
            )}
          </button>

          {status !== "idle" && (
            <button
              onClick={resetForm}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              Reset
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
      </section>

      {/* Results Section */}
      {result && (
        <section className="space-y-6">
          {/* Overall Score */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Overall Score
              </h2>
              <span
                className={`inline-flex items-center rounded-full px-4 py-1 text-2xl font-bold ${
                  result.overall >= 80
                    ? "bg-green-100 text-green-800"
                    : result.overall >= 60
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {result.overall}/100
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              {result.summary}
            </p>
          </div>

          {/* SMART Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            <ScoreCard
              label="Specific"
              detail={result.smart.specific}
              color="blue"
            />
            <ScoreCard
              label="Measurable"
              detail={result.smart.measurable}
              color="purple"
            />
            <ScoreCard
              label="Achievable"
              detail={result.smart.achievable}
              color="teal"
            />
            <ScoreCard
              label="Relevant"
              detail={result.smart.relevant}
              color="orange"
            />
            <ScoreCard
              label="Time-bound"
              detail={result.smart.timeBound}
              color="pink"
            />
          </div>
        </section>
      )}
    </main>
  );
}

function ScoreCard({
  label,
  detail,
  color,
}: {
  label: string;
  detail: { score: number; reasoning: string; suggestions: string };
  color: "blue" | "purple" | "teal" | "orange" | "pink";
}) {
  const colorMap: Record<
    string,
    { bg: string; text: string; bar: string; border: string }
  > = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      bar: "bg-blue-500",
      border: "border-blue-200",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-800",
      bar: "bg-purple-500",
      border: "border-purple-200",
    },
    teal: {
      bg: "bg-teal-50",
      text: "text-teal-800",
      bar: "bg-teal-500",
      border: "border-teal-200",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-800",
      bar: "bg-orange-500",
      border: "border-orange-200",
    },
    pink: {
      bg: "bg-pink-50",
      text: "text-pink-800",
      bar: "bg-pink-500",
      border: "border-pink-200",
    },
  };

  const c = colorMap[color];

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5 shadow-sm`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`text-base font-semibold ${c.text}`}>{label}</h3>
        <span
          className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-bold ${c.bg} ${c.text}`}
        >
          {detail.score}/100
        </span>
      </div>

      {/* Score bar */}
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${c.bar}`}
          style={{ width: `${detail.score}%` }}
        />
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-700">Reasoning:</span>
          <p className="mt-0.5 leading-relaxed text-gray-600">
            {detail.reasoning}
          </p>
        </div>
        {detail.suggestions && (
          <div>
            <span className="font-medium text-gray-700">Suggestions:</span>
            <p className="mt-0.5 leading-relaxed text-gray-600">
              {detail.suggestions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}