const isElectron = window.electronAPI !== undefined;

function ActionButtons({ fileInputRef, onFilesSelected, onClearAll, onMerge, isProcessing }) {
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      e.target.value = '';
    }
  };

  const handleAddFiles = async () => {
    if (isElectron) {
      // Use native Electron file dialog
      const files = await window.electronAPI.openFileDialog();
      if (files && files.length > 0) {
        // Convert base64 data back to File objects
        const fileObjects = files.map((f) => {
          const byteCharacters = atob(f.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          return new File([blob], f.name, { type: 'application/pdf' });
        });
        onFilesSelected(fileObjects);
      }
    } else {
      // Fallback to HTML file input for browser
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="btn-group">
      {!isElectron && (
        <input
          type="file"
          ref={fileInputRef}
          className="file-input"
          accept="application/pdf"
          multiple
          onChange={handleFileChange}
        />
      )}
      <button
        className="btn btn-secondary"
        onClick={handleAddFiles}
      >
        + Add PDF Files
      </button>
      <button className="btn btn-danger" onClick={onClearAll}>
        Clear All
      </button>
      <button
        className="btn btn-primary"
        onClick={onMerge}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Merge & Generate Index'}
      </button>
    </div>
  );
}

export default ActionButtons;
