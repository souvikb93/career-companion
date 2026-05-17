// Custom pdfjs worker entry point.
// Imports the polyfill BEFORE the pdfjs worker so Promise.withResolvers
// exists when pdfjs initializes inside the worker thread on older iOS Safari.
import "./legacy-webkit-polyfills";
import "pdfjs-dist/build/pdf.worker.min.mjs";
