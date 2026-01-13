/**
 * PDF Master Tool - Renderer Process
 * Handles PDF merging, page numbering, watermarks, and index generation
 */

const { PDFDocument, rgb, StandardFonts, degrees } = PDFLib;

// State
let fileStore = [];
let finalPdfBytes = null;
let indexData = [];
let sortableInstance = null;

// DOM Elements
const elements = {
  fileInput: document.getElementById('fileInput'),
  fileList: document.getElementById('fileList'),
  pageNumberToggle: document.getElementById('pageNumberToggle'),
  watermarkToggle: document.getElementById('watermarkToggle'),
  watermarkText: document.getElementById('watermarkText'),
  processBtn: document.getElementById('processBtn'),
  downloadPdfBtn: document.getElementById('downloadPdfBtn'),
  downloadExcelBtn: document.getElementById('downloadExcelBtn'),
  status: document.getElementById('status'),
};

/**
 * Initialize the application
 */
function init() {
  setupEventListeners();
  setupSortable();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  elements.fileInput.addEventListener('change', handleFileSelect);
  elements.processBtn.addEventListener('click', handleMerge);
  elements.downloadPdfBtn.addEventListener('click', downloadPdf);
  elements.downloadExcelBtn.addEventListener('click', downloadExcel);
}

/**
 * Initialize SortableJS for drag-and-drop reordering
 */
function setupSortable() {
  sortableInstance = new Sortable(elements.fileList, {
    animation: 150,
    handle: '.drag-handle',
    ghostClass: 'ghost',
  });
}

/**
 * Handle file selection
 */
function handleFileSelect(event) {
  const files = Array.from(event.target.files);

  files.forEach((file) => {
    const id = generateId();
    fileStore.push({ id, file });
    addFileToUI(id, file.name);
  });

  event.target.value = '';
}

/**
 * Generate unique ID
 */
function generateId() {
  return 'id_' + Math.random().toString(36).substring(2, 11);
}

/**
 * Add file item to the UI list
 */
function addFileToUI(id, name) {
  const li = document.createElement('li');
  li.className = 'file-item';
  li.dataset.id = id;
  li.innerHTML = `
    <span class="drag-handle">&#9776;</span>
    <span class="file-name">${escapeHtml(name)}</span>
    <span class="remove-btn" onclick="removeFile('${id}')">Remove</span>
  `;
  elements.fileList.appendChild(li);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Remove file from store and UI
 */
function removeFile(id) {
  fileStore = fileStore.filter((f) => f.id !== id);
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) el.remove();
}

/**
 * Clear all files
 */
function clearAll() {
  fileStore = [];
  elements.fileList.innerHTML = '';
  toggleResults(false);
  setStatus('');
}

/**
 * Toggle visibility of download buttons
 */
function toggleResults(show) {
  elements.downloadPdfBtn.hidden = !show;
  elements.downloadExcelBtn.hidden = !show;
}

/**
 * Set status message
 */
function setStatus(message, type = '') {
  elements.status.textContent = message;
  elements.status.className = 'status' + (type ? ` ${type}` : '');
}

/**
 * Main merge process
 */
async function handleMerge() {
  const order = Array.from(elements.fileList.children).map((li) => li.dataset.id);

  if (order.length === 0) {
    alert('Please add some files first!');
    return;
  }

  setStatus('Processing... please wait.');
  toggleResults(false);

  try {
    const mergedPdf = await PDFDocument.create();
    const addPageNumbers = elements.pageNumberToggle.checked;
    const addWatermark = elements.watermarkToggle.checked;
    const watermarkText = elements.watermarkText.value || 'CONFIDENTIAL';

    indexData = [];
    let globalPage = 1;

    // Process files in drag order
    for (let i = 0; i < order.length; i++) {
      const id = order[i];
      const fileObj = fileStore.find((f) => f.id === id);

      if (!fileObj) continue;

      const arrayBuffer = await fileObj.file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();

      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));

      indexData.push({
        sn: i + 1,
        name: fileObj.file.name,
        start: globalPage,
        end: globalPage + pageCount - 1,
        total: pageCount,
      });

      globalPage += pageCount;
    }

    // Apply page numbers and watermarks
    const pages = mergedPdf.getPages();
    const font = await mergedPdf.embedFont(StandardFonts.Helvetica);

    pages.forEach((page, idx) => {
      const { width, height } = page.getSize();

      if (addWatermark) {
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

      if (addPageNumbers) {
        page.drawText(`Page ${idx + 1} of ${pages.length}`, {
          x: width / 2 - 30,
          y: 20,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      }
    });

    finalPdfBytes = await mergedPdf.save();
    setStatus('Merge Successful!', 'success');
    toggleResults(true);
  } catch (error) {
    console.error('Merge error:', error);
    setStatus('Error: ' + error.message, 'error');
  }
}

/**
 * Download merged PDF
 */
function downloadPdf() {
  if (!finalPdfBytes) return;

  const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
  saveFile(blob, 'Merged_Document.pdf');
}

/**
 * Download Excel/CSV index
 */
function downloadExcel() {
  if (indexData.length === 0) return;

  let csv = 'S.No,File Name,Start Page,End Page,Total Pages\n';
  indexData.forEach((d) => {
    csv += `${d.sn},"${d.name}",${d.start},${d.end},${d.total}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  saveFile(blob, 'PDF_Index.csv');
}

/**
 * Save file to disk
 */
function saveFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Expose functions to global scope for inline event handlers
window.removeFile = removeFile;
window.clearAll = clearAll;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
