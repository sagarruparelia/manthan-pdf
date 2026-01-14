import { useCallback } from 'react';

function DownloadButtons({ visible, mergedPdf, indexData }) {
  const downloadPdf = useCallback(() => {
    if (!mergedPdf) return;

    const blob = new Blob([mergedPdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Merged_Document.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }, [mergedPdf]);

  const downloadExcel = useCallback(() => {
    if (!indexData || indexData.length === 0) return;

    let csv = 'S.No,File Name,Start Page,End Page,Total Pages\n';
    indexData.forEach((d) => {
      csv += `${d.sn},"${d.name}",${d.start},${d.end},${d.total}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PDF_Index.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [indexData]);

  if (!visible) return null;

  return (
    <div className="btn-group">
      <button className="btn btn-success" onClick={downloadPdf}>
        Download Merged PDF
      </button>
      <button className="btn btn-warning" onClick={downloadExcel}>
        Download Excel Index
      </button>
    </div>
  );
}

export default DownloadButtons;
