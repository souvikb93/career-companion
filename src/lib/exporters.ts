import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTextAsPDF(title: string, body: string, filename: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, margin, y);
  y += 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(body, maxWidth) as string[];
  for (const line of lines) {
    if (y > pageHeight - margin) { doc.addPage(); y = margin; }
    doc.text(line, margin, y);
    y += 16;
  }
  doc.save(filename + ".pdf");
}

export async function exportTextAsDOCX(title: string, body: string, filename: string) {
  const paragraphs = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(title)] }),
    ...body.split("\n").map((line) =>
      new Paragraph({ children: [new TextRun(line)] })
    ),
  ];
  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, filename + ".docx");
}

export function exportTextAsTXT(title: string, body: string, filename: string) {
  const blob = new Blob([title + "\n\n" + body], { type: "text/plain" });
  downloadBlob(blob, filename + ".txt");
}

export type ExportFormat = "pdf" | "docx" | "txt";

export async function exportAs(
  format: ExportFormat,
  title: string,
  body: string,
  filename: string,
) {
  if (format === "pdf") return exportTextAsPDF(title, body, filename);
  if (format === "docx") return exportTextAsDOCX(title, body, filename);
  return exportTextAsTXT(title, body, filename);
}
