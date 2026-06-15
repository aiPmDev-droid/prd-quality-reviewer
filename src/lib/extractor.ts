export type SupportedFormat = "pdf" | "docx" | "md";

export function getFormat(filename: string): SupportedFormat | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  if (ext === "md") return "md";
  return null;
}

export async function extractTextFromPDF(
  buffer: ArrayBuffer
): Promise<string> {
  // Dynamic import so pdfjs-dist only loads in browser (not during SSR/build)
  const pdfjsLib = await import("pdfjs-dist");

  // Set worker source — use CDN to avoid bundling worker
  const workerSrc =
    "https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs";
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str).join(" ");
    pages.push(text);
  }

  return pages.join("\n\n");
}

export async function extractTextFromDOCX(
  buffer: ArrayBuffer
): Promise<string> {
  // Dynamic import for mammoth too
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

export async function extractTextFromMD(text: string): Promise<string> {
  // Markdown is already plain text; strip any frontmatter if present
  const cleaned = text.replace(/^---[\s\S]*?---\n?/, "").trim();
  return cleaned;
}