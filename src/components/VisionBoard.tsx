import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Camera, Type, Upload, X, FlipHorizontal, Save, Download, RotateCcw, ArrowLeft, StickyNote } from 'lucide-react';
import NotesPanel from './NotesPanel';
import { useVisionBoardData, VisionItem, TextElement } from '../hooks/useVisionBoardData';

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
  "This feeling drives me forward",
  "I am becoming this person", 
  "This is my daily reality",
  "I live this truth",
  "This energy flows through me",
  "I embody this vision"
];

const SAMPLE_IMAGES = [
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400'
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
    addTextElement,
    removeTextElement,
    addUploadedImage,
    removeUploadedImage,
    saveData,
    exportData,
    importData,
    clearAllData,
    getCompletionStats
  } = useVisionBoardData();

  const [draggedItem, setDraggedItem] = useState<{ type: 'card' | 'text'; id: string } | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  
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

  const handleFileUpload = useCallback(async (files: FileList) => {
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
          }
        }
      }
      
      addUploadedImage(...newImages);
      setIsUploading(false);
      
      if (newImages.length > 0) {
        addVisionItem(newImages[0]);
      }
      
    } catch (error) {
      console.error('Failed to process files:', error);
      setIsUploading(false);
      alert('Failed to upload some images. Please try again with smaller files.');
    }
  }, []);

  const addVisionCard = useCallback((imageUrl: string) => {
    addVisionItem(imageUrl);
    setShowImageOptions(false);
  }, [addVisionItem]);

  const addText = useCallback((text: string) => {
    addTextElement(text);
  }, [addTextElement]);

  const flipCard = useCallback((cardId: string) => {
    const item = visionItems.find(item => item.id === cardId);
    if (item) {
      updateVisionItem(cardId, { isFlipped: !item.isFlipped });
    }
  }, [visionItems, updateVisionItem]);

  const updateCard = useCallback((cardId: string, updates: Partial<VisionItem>) => {
    updateVisionItem(cardId, updates);
  }, [updateVisionItem]);

  const handleMouseDown = useCallback((e: React.MouseEvent, id: string, type: 'card' | 'text') => {
    setDraggedItem({ type, id });
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedItem || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (draggedItem.type === 'card') {
      updateVisionItem(draggedItem.id, { position: { x, y } });
    } else {
      const textEl = textElements.find(el => el.id === draggedItem.id);
      if (textEl) {
        // Note: This would need a updateTextElement function in the hook
        // For now, we'll handle this differently
      }
    }
  }, [draggedItem, updateVisionItem, textElements]);

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const removeItem = useCallback((id: string, type: 'card' | 'text') => {
    if (type === 'card') {
      removeVisionItem(id);
    } else {
      removeTextElement(id);
    }
  }, [removeVisionItem, removeTextElement]);

  const handleRemoveUploadedImage = useCallback((imageUrl: string) => {
    removeUploadedImage(imageUrl);
  }, [removeUploadedImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

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

  const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const success = importData(e.target?.result as string);
        if (success) {
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
  }, [importData]);

  const handleClearAllData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all your vision board data? This action cannot be undone.')) {
      clearAllData();
    }
  }, [clearAllData]);

  const handleSaveNow = useCallback(() => {
    saveData();
    alert('Vision board saved successfully!');
  }, [saveData]);

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
          <p className="text-slate-600 mt-2">
            Create visual representations of your goals across four key life areas
          </p>
          {lastSaved && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
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
            onClick={handleSaveNow}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Now</span>
          </button>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <StickyNote className="w-4 h-4" />
            <span>Notes</span>
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
          
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="hidden"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="text-center">
              <div className="text-slate-500 text-sm">Vision Cards</div>
              <div className="font-semibold text-slate-900">{stats.totalCards}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500 text-sm">With Meaning</div>
              <div className="font-semibold text-slate-900">{stats.cardsWithMeaning}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500 text-sm">Text Elements</div>
              <div className="font-semibold text-slate-900">{stats.customTextElements}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500 text-sm">Uploaded Images</div>
              <div className="font-semibold text-slate-900">{uploadedImages.length}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500 text-sm">Storage Used</div>
              <div className="font-semibold text-slate-900">Auto-managed</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setShowImageOptions(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-blue-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
        >
          <Camera className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-slate-700">Add Vision Card</span>
        </button>
        
        <div className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-purple-200 rounded-xl">
          <Type className="w-5 h-5 text-purple-600" />
          <input
            type="text"
            placeholder="Add inspiring text..."
            defaultValue=""
            onKeyDown={(e) => {
              const target = e.target as HTMLInputElement;
              if (e.key === 'Enter' && target.value.trim()) {
                addText(target.value.trim());
                target.value = '';
              }
            }}
            className="bg-transparent outline-none placeholder-slate-400 font-medium text-slate-700 w-48"
          />
        </div>
      </div>

      {/* Vision Board Canvas */}
      <div 
        ref={canvasRef}
        className="relative bg-white rounded-2xl shadow-xl border border-slate-200 mx-auto overflow-hidden"
        style={{ width: '800px', height: '600px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Vision Cards */}
        {visionItems.map((item) => {
          const sizeStyles = getSizeStyles(item.size || 'medium');
          return (
            <div
              key={item.id}
              className="absolute cursor-move group"
              style={{ 
                left: item.position?.x || 0, 
                top: item.position?.y || 0
              }}
              onMouseDown={(e) => handleMouseDown(e, item.id, 'card')}
            >
              <div 
                className="relative transition-transform duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: item.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  ...sizeStyles
                }}
              >
                {/* Front Side (Image) */}
                <div 
                  className="absolute inset-0 rounded-xl shadow-lg border-4 border-white hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                  style={{ backfaceVisibility: 'hidden' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!draggedItem) flipCard(item.id);
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt="Vision"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-black group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center pointer-events-none">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-white bg-opacity-90 rounded-full p-2">
                        <FlipHorizontal className="w-4 h-4 text-slate-700" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back Side (Text) */}
                <div 
                  className="absolute inset-0 rounded-xl shadow-lg border-4 border-white bg-slate-50"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 h-full flex flex-col items-center justify-center">
                    <p className="text-center text-slate-600 text-lg font-medium">
                      Tell me more
                    </p>
                    
                    {/* Flip Back Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        flipCard(item.id);
                      }}
                      className="mt-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs flex items-center space-x-1"
                    >
                      <FlipHorizontal className="w-3 h-3" />
                      <span>Flip Back</span>
                    </button>
                  </div>
                </div>

                {/* Size Controls */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex bg-white rounded-full shadow-lg border border-slate-200 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCard(item.id, { size: 'small' });
                    }}
                    className={`px-2 py-1 text-xs rounded-l-full transition-colors ${
                      (item.size || 'medium') === 'small' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    S
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCard(item.id, { size: 'medium' });
                    }}
                    className={`px-2 py-1 text-xs transition-colors ${
                      (item.size || 'medium') === 'medium' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCard(item.id, { size: 'large' });
                    }}
                    className={`px-2 py-1 text-xs rounded-r-full transition-colors ${
                      (item.size || 'medium') === 'large' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    L
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id, 'card');
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-sm font-bold hover:bg-red-600 z-10"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}

        {/* Text Elements */}
        {textElements.map((textEl) => (
          <div
            key={textEl.id}
            className="absolute cursor-move group select-none"
            style={{ 
              left: textEl.position.x, 
              top: textEl.position.y,
              color: textEl.color
            }}
            onMouseDown={(e) => handleMouseDown(e, textEl.id, 'text')}
          >
            <div className="relative">
              <div className="bg-white bg-opacity-90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-white font-semibold text-lg">
                {textEl.text}
              </div>
              <button
                onClick={() => removeItem(textEl.id, 'text')}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs font-bold hover:bg-red-600"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {visionItems.length === 0 && textElements.length === 0 && (
          <div 
            className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl m-4"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-700 mb-3">Create Your Personal Vision</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
                Drag & drop your photos here or click "Add Vision Card" to upload images that represent your dreams and goals.
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Drag & drop images</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FlipHorizontal className="w-4 h-4" />
                  <span>Flip to add meaning</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        {visionItems.length > 0 && (
          <div className="absolute bottom-4 left-4 text-xs text-slate-400 bg-white bg-opacity-80 px-2 py-1 rounded">
            Click cards to flip • Drag to move • Hover for size controls • Enter saves & flips back
          </div>
        )}
      </div>

      {/* Image Options Modal */}
      {showImageOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-slate-900">Add Your Vision Images</h3>
              <button 
                onClick={() => setShowImageOptions(false)}
                className="w-8 h-8 text-slate-400 hover:text-slate-600 text-2xl flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Upload Section */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-slate-900 mb-4">Upload Your Photos</h4>
              <div 
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-700 mb-2">
                  {isUploading ? 'Uploading...' : 'Drop your images here or click to browse'}
                </p>
                <p className="text-sm text-slate-500">
                  Upload photos that represent your dreams, goals, and aspirations
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Uploaded Images */}
            {uploadedImages.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-medium text-slate-900 mb-4">Your Uploaded Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <button
                        onClick={() => addVisionCard(imageUrl)}
                        className="aspect-square rounded-xl overflow-hidden hover:scale-105 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-300 w-full"
                      >
                        <img src={imageUrl} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                      <button
                        onClick={() => handleRemoveUploadedImage(imageUrl)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-sm font-bold hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Images */}
            <div>
              <h4 className="text-lg font-medium text-slate-900 mb-4">Or Choose from Samples</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SAMPLE_IMAGES.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => addVisionCard(url)}
                    className="aspect-square rounded-xl overflow-hidden hover:scale-105 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-300"
                  >
                    <img src={url} alt={`Sample ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Text Suggestions */}
      {visionItems.length > 0 && textElements.length === 0 && (
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-3">Quick add inspiring text:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {INSPIRING_PHRASES.map((phrase, index) => (
              <button
                key={index}
                onClick={() => addText(phrase)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress & Actions */}
      {visionItems.length > 0 && (
        <div className="space-y-6">
          {visionItems.some(item => !item.meaning && !item.feeling) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-amber-700 font-medium">
                💡 Click your vision cards to flip them and add what they mean to you
              </p>
              <p className="text-amber-600 text-sm mt-1">
                Personal meaning is what transforms images into powerful motivation
              </p>
            </div>
          )}

          <div className="text-center bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Turn Vision into Action</h3>
            <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Your vision cards represent the life you're creating. Use Coach Pack's Goals section to break these dreams into specific weekly actions.
            </p>
          </div>
        </div>
      )}

      {/* Notes Panel */}
      {showNotes && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <NotesPanel feature="vision" />
        </div>
      )}
    </div>
  );
};

export default VisionBoard;