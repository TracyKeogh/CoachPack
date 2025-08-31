import React, { useState, useCallback, useRef } from 'react';
import { Camera, Type, Upload, X, FlipHorizontal, Save, Download, RotateCcw } from 'lucide-react';
import { useVisionBoardData } from '../hooks/useVisionBoardData';

// Image compression utility
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = (width * maxWidth) / height;
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const INSPIRING_PHRASES = [
  'This feeling drives me forward',
  'I am becoming this person',
  'This is my daily reality',
  'I live this truth',
  'This energy flows through me',
  'I embody this vision',
];

const SAMPLE_IMAGES = [
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400',
];

const VisionBoard: React.FC = () => {
  const {
    visionItems,
    textElements,
    uploadedImages,
    isLoaded,
    lastSaved,
    addVisionItem,
    updateVisionItem,
    removeVisionItem,
    addUploadedImage,
    removeUploadedImage,
    addTextElement,
    updateTextContent,
    updateTextPosition, // Added for text element dragging
    removeTextElement,
    saveData,
    getCompletionStats,
    exportData,
    importData,
    clearAllData,
  } = useVisionBoardData();

  const [draggedItem, setDraggedItem] = useState<{ type: 'card' | 'text'; id: string } | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [newText, setNewText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return { width: '120px', height: '96px' };
      case 'medium':
        return { width: '160px', height: '128px' };
      case 'large':
        return { width: '200px', height: '160px' };
      default:
        return { width: '160px', height: '128px' };
    }
  };

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      setIsUploading(true);
      const newImages: string[] = [];

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type.startsWith('image/')) {
            try {
              // Compress image before storing
              const compressedImage = await compressImage(file, 800, 0.7);
              newImages.push(compressedImage);
              addUploadedImage(compressedImage);
            } catch (compressionError) {
              console.error('Failed to compress image:', compressionError);
              // Fallback to original file if compression fails
              const reader = new FileReader();
              const originalImage = await new Promise<string>((resolve, reject) => {
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
              newImages.push(originalImage);
              addUploadedImage(originalImage);
            }
          }
        }

        // Automatically add the first uploaded image as a new vision card
        if (newImages.length > 0) {
          addVisionCard(newImages[0]);
        }
      } catch (error) {
        console.error('Failed to process files:', error);
        alert('Failed to upload some images. Please try again with smaller files.');
      } finally {
        setIsUploading(false);
      }
    },
    [addUploadedImage, addVisionItem] // using addVisionItem via addVisionCard
  );

  const addVisionCard = useCallback(
    (imageUrl: string) => {
      const newItemId = addVisionItem(imageUrl);
      setShowImageOptions(false);
      return newItemId;
    },
    [addVisionItem]
  );

  const addText = useCallback(
    (text: string) => {
      // Use hook API: if it accepts text, pass it; else add then update.
      const idOrVoid = (addTextElement as any)(text);
      if (typeof idOrVoid !== 'string') {
        const id = (addTextElement as any)() as string;
        if (id) updateTextContent(id, text);
      }
      setNewText('');
    },
    [addTextElement, updateTextContent]
  );

  const flipCard = useCallback(
    (cardId: string) => {
      const card = visionItems.find((item) => item.id === cardId);
      if (card) {
        updateVisionItem(cardId, { isFlipped: !card.isFlipped });
      }
    },
    [visionItems, updateVisionItem]
  );

  const updateCard = useCallback(
    (cardId: string, updates: Partial<any>) => {
      updateVisionItem(cardId, updates);
    },
    [updateVisionItem]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent, id: string, type: 'card' | 'text') => {
    setDraggedItem({ type, id });
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedItem || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (draggedItem.type === 'card') {
        updateVisionItem(draggedItem.id, { position: { x, y } });
      } else {
        updateTextPosition(draggedItem.id, { x, y });
      }
    },
    [draggedItem, updateVisionItem, updateTextPosition]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const removeItem = useCallback(
    (id: string, type: 'card' | 'text') => {
      if (type === 'card') {
        removeVisionItem(id);
      } else {
        removeTextElement(id);
      }
    },
    [removeVisionItem, removeTextElement]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload]
  );

  const handleExportData = useCallback(() => {
    const dataString = exportData();
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vision-board-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportData]);

  const handleImportData = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (importData(content)) {
            alert('Vision board data imported successfully!');
          } else {
            alert('Invalid file format. Please select a valid vision board export file.');
          }
        } catch (error) {
          console.error('Failed to import data:', error);
          alert('Invalid file format. Please select a valid vision board export file.');
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [importData]
  );

  const handleClearAllData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all your vision board data? This action cannot be undone.')) {
      clearAllData();
    }
  }, [clearAllData]);

  const stats = getCompletionStats();

  if (!isLoaded) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Your Vision Board...</h2>
            <p className="text-slate-600">Retrieving your saved progress...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vision Board</h1>
          <p className="text-slate-600 mt-2">Create visual representations of your goals across four key life areas</p>
          {lastSaved && <p className="text-sm text-green-600 mt-1">✓ Last saved: {lastSaved.toLocaleTimeString()}</p>}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDataManagement(!showDataManagement)}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Data</span>
          </button>

          <button
            onClick={saveData}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Now</span>
          </button>
        </div>
      </div>

      {/* Data Management Panel */}
      {showDataManagement && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={handleExportData}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>

            <button
              onClick={() => importInputRef.current?.click()}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
            >
              <Upload className="w-4 h-4" />
              <span>Import Data</span>
            </button>

            <button
              onClick={handleClearAllData}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Board</span>
            </button>
          </div>

          <input ref={importInputRef} type="file" accept=".json" onChange={handleImportData} className="hidden" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="text-center">
              <div className="text-slate-500 text-sm">Vision Items</div>
              <div className="font-semibold text-slate-900">{stats.totalItems}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500 text-sm">With Meaning</div>
              <div className="font-semibold text-slate-900">{stats.itemsWithCustomContent}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500 text-sm">Text Elements</div>
              <div className="font-semibold text-slate-900">{stats.customTextElements}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500 text-sm">Completion</div>
              <div className="font-semibold text-slate-900">{stats.completionPercentage}%</div>
