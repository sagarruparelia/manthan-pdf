import { useState, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

export function usePdfMerger() {
  const [status, setStatus] = useState({ type: '', message: '' });
  const [mergedPdf, setMergedPdf] = useState(null);
  const [indexData, setIndexData] = useState([]);

  const mergePdfs = useCallback(async (files, settings) => {
    setStatus({ type: 'processing', message: 'Processing... please wait.' });
    setMergedPdf(null);
    setIndexData([]);

    try {
      const pdfDoc = await PDFDocument.create();
      const newIndexData = [];
      let globalPage = 1;

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const { file } = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pageCount = pdf.getPageCount();

        const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => pdfDoc.addPage(page));

        newIndexData.push({
          sn: i + 1,
          name: file.name,
          start: globalPage,
          end: globalPage + pageCount - 1,
          total: pageCount,
        });

        globalPage += pageCount;
      }

      // Apply page numbers and watermarks
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const watermarkText = settings.watermarkText || 'CONFIDENTIAL';

      pages.forEach((page, idx) => {
        const { width, height } = page.getSize();

        if (settings.watermark) {
          page.drawText(watermarkText, {
            x: width / 5,
            y: height / 3,
            size: 55,
            font,
            color: rgb(0.8, 0.8, 0.8),
            opacity: 0.35,
            rotate: degrees(45),
          });
        }

        if (settings.pageNumbers) {
          page.drawText(`Page ${idx + 1} of ${pages.length}`, {
            x: width / 2 - 30,
            y: 20,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      setMergedPdf(pdfBytes);
      setIndexData(newIndexData);
      setStatus({ type: 'success', message: 'Merge Successful!' });
    } catch (error) {
      console.error('Merge error:', error);
      setStatus({ type: 'error', message: `Error: ${error.message}` });
    }
  }, []);

  const resetMerge = useCallback(() => {
    setStatus({ type: '', message: '' });
    setMergedPdf(null);
    setIndexData([]);
  }, []);

  return {
    status,
    mergedPdf,
    indexData,
    mergePdfs,
    resetMerge,
  };
}
