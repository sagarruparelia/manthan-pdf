import { useState, useRef, useCallback } from 'react';
import Header from './components/Header';
import Settings from './components/Settings';
import FileList from './components/FileList';
import ActionButtons from './components/ActionButtons';
import DownloadButtons from './components/DownloadButtons';
import Status from './components/Status';
import { usePdfMerger } from './hooks/usePdfMerger';

function App() {
  const [files, setFiles] = useState([]);
  const [settings, setSettings] = useState({
    pageNumbers: true,
    watermark: false,
    watermarkText: '',
  });
  const fileInputRef = useRef(null);

  const { status, mergedPdf, indexData, mergePdfs, resetMerge } = usePdfMerger();

  const handleFilesSelected = useCallback((selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map((file) => ({
      id: `id_${Math.random().toString(36).substring(2, 11)}`,
      file,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    resetMerge();
  }, [resetMerge]);

  const handleReorder = useCallback((newOrder) => {
    setFiles(newOrder);
  }, []);

  const handleMerge = useCallback(async () => {
    if (files.length === 0) {
      alert('Please add some files first!');
      return;
    }
    await mergePdfs(files, settings);
  }, [files, settings, mergePdfs]);

  const handleSettingsChange = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="container">
      <Header />

      <Settings settings={settings} onChange={handleSettingsChange} />

      <ActionButtons
        fileInputRef={fileInputRef}
        onFilesSelected={handleFilesSelected}
        onClearAll={handleClearAll}
        onMerge={handleMerge}
        isProcessing={status.type === 'processing'}
      />

      <FileList
        files={files}
        onRemove={handleRemoveFile}
        onReorder={handleReorder}
        onFilesAdded={handleFilesSelected}
      />

      <Status status={status} />

      <DownloadButtons
        visible={status.type === 'success'}
        mergedPdf={mergedPdf}
        indexData={indexData}
      />
    </div>
  );
}

export default App;
