import { useEffect, useRef, useState, useCallback } from 'react';
import Sortable from 'sortablejs';

const isElectron = window.electronAPI !== undefined;

function FileList({ files, onRemove, onReorder, onFilesAdded }) {
  const listRef = useRef(null);
  const sortableRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Listen for context menu actions from Electron
  useEffect(() => {
    if (isElectron) {
      window.electronAPI.onContextMenuAction((action, fileId) => {
        if (action === 'remove') {
          onRemove(fileId);
        }
      });
    }
  }, [onRemove]);

  const handleContextMenu = useCallback((e, fileId) => {
    e.preventDefault();
    if (isElectron) {
      window.electronAPI.showContextMenu(fileId);
    }
  }, []);

  useEffect(() => {
    if (listRef.current && !sortableRef.current) {
      sortableRef.current = new Sortable(listRef.current, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'ghost',
        onEnd: (evt) => {
          const newOrder = [...files];
          const [movedItem] = newOrder.splice(evt.oldIndex, 1);
          newOrder.splice(evt.newIndex, 0, movedItem);
          onReorder(newOrder);
        },
      });
    }

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, []);

  // Update sortable when files change
  useEffect(() => {
    if (sortableRef.current) {
      sortableRef.current.option('onEnd', (evt) => {
        const newOrder = [...files];
        const [movedItem] = newOrder.splice(evt.oldIndex, 1);
        newOrder.splice(evt.newIndex, 0, movedItem);
        onReorder(newOrder);
      });
    }
  }, [files, onReorder]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'application/pdf'
    );

    if (droppedFiles.length > 0 && onFilesAdded) {
      onFilesAdded(droppedFiles);
    }
  }, [onFilesAdded]);

  return (
    <div
      className={`drop-zone ${isDraggingOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <ul ref={listRef} className="file-list">
        {files.length === 0 ? (
          <li className="file-list-empty">
            {isDraggingOver
              ? 'Drop PDF files here...'
              : 'No files added. Drag PDFs here or click "+ Add PDF Files"'}
          </li>
        ) : (
        files.map((item) => (
          <li
            key={item.id}
            className="file-item"
            data-id={item.id}
            onContextMenu={(e) => handleContextMenu(e, item.id)}
          >
            <span className="drag-handle">&#9776;</span>
            <span className="file-name">{item.file.name}</span>
            <button
              className="remove-btn"
              onClick={() => onRemove(item.id)}
              type="button"
            >
              Remove
            </button>
          </li>
        ))
        )}
      </ul>
    </div>
  );
}

export default FileList;
