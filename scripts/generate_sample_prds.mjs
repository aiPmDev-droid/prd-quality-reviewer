/**
 * Script to generate sample PRDs in PDF and DOCX formats.
 * Run: node scripts/generate_sample_prds.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "..", "sample_prds");

// ─── PRD Content ───────────────────────────────────────────────────────────

const prdGood = `# PRD: Real-Time Fraud Detection for Payment Gateway

## Problem Statement
Our payment gateway processed $2.4B in volume last year with a 0.7% fraud rate (industry avg: 0.3%). We lost an estimated $16.8M to fraud. Current batch-processing detection (24-hour delay) is insufficient.

## Business Objectives
1. Reduce fraud rate from 0.7% to ≤0.35% within 6 months of launch
2. Maintain false positive rate below 2%
3. Keep P95 latency under 200ms for payment authorization

## Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Fraud rate (% of volume) | 0.7% | ≤0.35% |
| False positive rate | ~3% | ≤2% |
| Auth latency (P95) | 120ms | ≤200ms |
| Engineering cost | N/A | ≤$25K/month (GCP) |

## Target Users
- Primary: Payments risk team (5 analysts)
- Secondary: End customers (transparent experience)

## Feature Requirements

### F1: Real-Time Scoring Engine
- Score each transaction (0-100) at authorization time
- Features: velocity, device fingerprint, geolocation, amount deviation
- Rules engine override for known-good merchants

### F2: Decision Orchestration
- Score < 30 → auto-approve
- Score 30-70 → 3DS challenge (step-up auth)
- Score > 70 → decline with reason code
- Analyst override within 5-minute window for VIP customers

### F3: Feedback Loop
- Analysts mark false positives/negatives in dashboard
- Labeled data retrains model weekly
- A/B test framework: model v2 vs v1 on 5% shadow traffic

## Non-Requirements
- Chargeback representment (existing system)
- PCI-compliant storage (separate initiative)

## Timeline
| Milestone | Date | Deliverable |
|-----------|------|-------------|
| Real-time scoring API | Week 6 | POC, manually tested |
| Decision orchestration | Week 8 | Full flow |
| ML model v1 | Week 10 | Trained on 12 months data |
| Shadow mode | Weeks 11-12 | 5% traffic |
| Phased rollout | Weeks 13-15 | 10% → 25% → 50% → 100% |

## Risks
| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Latency spike from ML | Medium | Fallback to rules-only via feature flag |
| Model drift | High | Weekly retraining + drift detection |
| High false positive rate | Medium | Analyst override + manual review queue`

const prdVague = `# PRD: Customer Analytics Dashboard

## Background
Our customer success team currently uses 4 different tools to track user behavior. They need a unified dashboard.

## Vision
Build a great dashboard that shows everything about our customers in one place.

## Goals
- Make CS team more efficient
- Improve customer satisfaction
- Reduce churn

## Requirements
- Show monthly active users
- Show feature usage stats
- Show customer health scores
- Dashboard should be fast and beautiful
- Export to CSV

## Considerations
- Should integrate with existing data pipeline
- Need to think about permissions - who can see what
- Consider what metrics matter most
- Maybe we can use an existing BI tool instead

## Timeline
- Start: ASAP
- Launch: When it's ready`

// ─── PDF Generation ─────────────────────────────────────────────────────────

async function generatePDF(content, filePath) {
  const PDFDocument = (await import("pdfkit")).default;
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Title
  doc.fontSize(18).font("Helvetica-Bold").text("PRD Quality Reviewer", { align: "center" });
  doc.fontSize(10).font("Helvetica").text("Sample PRD Document", { align: "center" });
  doc.moveDown(1.5);

  // Content
  doc.fontSize(11).font("Helvetica");
  const lines = content.split("\n");
  for (const line of lines) {
    if (line.startsWith("# PRD:")) {
      doc.fontSize(16).font("Helvetica-Bold").text(line.replace("# PRD:", "").trim());
      doc.moveDown(0.5);
    } else if (line.startsWith("## ")) {
      doc.fontSize(13).font("Helvetica-Bold").text(line.replace("## ", "").trim());
      doc.moveDown(0.3);
    } else if (line.startsWith("### ")) {
      doc.fontSize(12).font("Helvetica-BoldOblique").text(line.replace("### ", "").trim());
      doc.moveDown(0.2);
    } else if (line.startsWith("| ")) {
      doc.fontSize(10).font("Courier").text(line);
    } else if (line.trim() === "") {
      doc.moveDown(0.3);
    } else if (line.startsWith("- **")) {
      const boldMatch = line.match(/- \*\*(.+?)\*\*(.*)/);
      if (boldMatch) {
        doc.fontSize(10).font("Helvetica-Bold").text(`- ${boldMatch[1]}`, { continued: true });
        doc.font("Helvetica").text(boldMatch[2]);
      }
    } else {
      doc.fontSize(10).font("Helvetica").text(line);
    }
  }

  doc.end();
  await new Promise((resolve) => stream.on("finish", resolve));
  console.log(`  ✓ PDF created: ${path.basename(filePath)}`);
}

// ─── DOCX Generation ────────────────────────────────────────────────────────

async function generateDOCX(content, filePath) {
  const docx = await import("docx");
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType } = docx;

  const children = [];
  const lines = content.split("\n");

  for (const line of lines) {
    if (line.startsWith("# PRD:")) {
      children.push(
        new Paragraph({
          text: line.replace("# PRD:", "").trim(),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    } else if (line.startsWith("## ")) {
      children.push(
        new Paragraph({
          text: line.replace("## ", "").trim(),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (line.startsWith("### ")) {
      children.push(
        new Paragraph({
          text: line.replace("### ", "").trim(),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 150, after: 50 },
        })
      );
    } else if (line.startsWith("| ")) {
      // Skip table rows in simple rendering (tables are complex in docx)
    } else if (line.trim() === "") {
      children.push(new Paragraph({ spacing: { after: 60 } }));
    } else if (line.startsWith("- **")) {
      const boldMatch = line.match(/- \*\*(.+?)\*\*(.*)/);
      if (boldMatch) {
        children.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: `- ${boldMatch[1]}`, bold: true }),
              new TextRun({ text: boldMatch[2] }),
            ],
          })
        );
      }
    } else if (line.startsWith("- ")) {
      children.push(
        new Paragraph({
          text: line,
          spacing: { before: 40, after: 40 },
          bullet: { level: 0 },
        })
      );
    } else if (line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") || line.startsWith("4.")) {
      children.push(
        new Paragraph({
          text: line,
          spacing: { before: 40, after: 40 },
        })
      );
    } else {
      children.push(
        new Paragraph({
          text: line,
          spacing: { after: 60 },
        })
      );
    }
  }

  const doc = new Document({
    title: "Sample PRD",
    description: "Sample Product Requirements Document",
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [{ properties: {}, children }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
  console.log(`  ✓ DOCX created: ${path.basename(filePath)}`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("Generating sample PRD files...\n");

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // PDF: Good PRD (fraud detection)
  await generatePDF(prdGood, path.join(outputDir, "prd_good_fraud_detection.pdf"));

  // PDF: Vague PRD (dashboard analytics)
  await generatePDF(prdVague, path.join(outputDir, "prd_vague_dashboard.pdf"));

  // DOCX: Good PRD (fraud detection)
  await generateDOCX(prdGood, path.join(outputDir, "prd_good_fraud_detection.docx"));

  // DOCX: Vague PRD (dashboard analytics)
  await generateDOCX(prdVague, path.join(outputDir, "prd_vague_dashboard.docx"));

  console.log("\nDone! Files created:");
  console.log("  sample_prds/prd_good_fraud_detection.pdf");
  console.log("  sample_prds/prd_vague_dashboard.pdf");
  console.log("  sample_prds/prd_good_fraud_detection.docx");
  console.log("  sample_prds/prd_vague_dashboard.docx");
}

main().catch(console.error);