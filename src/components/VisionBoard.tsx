import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  Edit3, 
  Plus, 
  FileText, 
  RotateCw, 
  Eye, 
  EyeOff,
  Save,
  ArrowLeft,
  StickyNote
} from 'lucide-react';
import { useVisionBoardData } from '../hooks/useVisionBoardData';
import NotesPanel from './NotesPanel';

// Drag and Drop Types
const ItemTypes = {
  VISION_ITEM: 'visionItem',
  TEXT_ELEMENT: 'textElement'
};

interface DragItem {
  id: string;
  type: string;
  quadrant?: string;
  index?: number;
}

const VisionBoard: React.FC = () => {
  // Use the centralized data hook
  const {
    visionItems,
    textElements,
    uploadedImages,
    isCollageEditMode,
    isLoaded,
    lastSaved,
    addVisionItem,
    updateVisionItem,
    removeVisionItem,
    moveVisionItem,
    updateItemPosition,
    addUploadedImage,
    removeUploadedImage,
    addTextElement,
    updateTextPosition,
    updateTextContent,
    removeTextElement,
    setIsCollageEditMode,
    saveData,
    getCompletionStats,
    exportData,
    importData,
    clearAllData
  } = useVisionBoardData();

  // Local UI state
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const stats = getCompletionStats();

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          if (imageUrl) {
            addUploadedImage(imageUrl);
            addVisionItem(imageUrl);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    event.target.value = '';
  }, [addUploadedImage, addVisionItem]);

  // Add vision card from URL
  const addVisionCard = useCallback((imageUrl: string, quadrant?: string) => {
    addVisionItem(imageUrl, quadrant);
  }, [addVisionItem]);

  // Update card details
  const updateCard = useCallback((cardId: string, updates: any) => {
    updateVisionItem(cardId, updates);
  }, [updateVisionItem]);

  // Remove item (vision card or text)
  const removeItem = useCallback((itemId: string, itemType: 'vision' | 'text') => {
    if (itemType === 'vision') {
      removeVisionItem(itemId);
    } else {
      removeTextElement(itemId);
    }
  }, [removeVisionItem, removeTextElement]);

  // Add text element
  const addText = useCallback(() => {
    const newTextId = addTextElement(newText || 'New Text');
    setNewText('');
    return newTextId;
  }, [addTextElement, newText]);

  // Flip card handler
  const flipCard = useCallback((cardId: string) => {
    const card = visionItems.find(item => item.id === cardId);
    if (card) {
      updateVisionItem(cardId, { isFlipped: !card.isFlipped });
    }
  }, [visionItems, updateVisionItem]);

  // Export data handler
  const handleExportData = useCallback(() => {
    const dataStr = exportData();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vision-board-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportData]);

  // Import data handler
  const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content && importData(content)) {
          alert('Vision board imported successfully!');
        } else {
          alert('Failed to import vision board. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  }, [importData]);

  // Clear all data handler
  const handleClearAllData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all vision board data? This cannot be undone.')) {
      clearAllData();
    }
  }, [clearAllData]);

  // Draggable Vision Item Component
  const DraggableVisionItem: React.FC<{ item: any; index: number; quadrant: string }> = ({ item, index, quadrant }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.VISION_ITEM,
      item: { id: item.id, type: ItemTypes.VISION_ITEM, quadrant, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div
        ref={drag}
        className={`relative group cursor-move ${isDragging ? 'opacity-50' : ''}`}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-32 object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/200x150?text=Image+Not+Found';
            }}
          />
          
          {/* Overlay with controls */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
              <button
                onClick={() => setEditingCard(item.id)}
                className="p-1 bg-white rounded-full hover:bg-gray-100 transition-colors"
              >
                <Edit3 className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={() => flipCard(item.id)}
                className="p-1 bg-white rounded-full hover:bg-gray-100 transition-colors"
              >
                <RotateCw className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={() => removeItem(item.id, 'vision')}
                className="p-1 bg-white rounded-full hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Title */}
        <div className="mt-2 text-sm font-medium text-gray-800 truncate">
          {item.title}
        </div>
      </div>
    );
  };

  // Droppable Quadrant Component
  const DroppableQuadrant: React.FC<{ quadrant: string; title: string; items: any[] }> = ({ quadrant, title, items }) => {
    const [{ isOver }, drop] = useDrop({
      accept: ItemTypes.VISION_ITEM,
      drop: (item: DragItem) => {
        if (item.quadrant !== quadrant) {
          // Move item to new quadrant
          const dragIndex = item.index || 0;
          moveVisionItem(dragIndex, 0, item.quadrant || '', quadrant);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return (
      <div
        ref={drop}
        className={`border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] transition-colors ${
          isOver ? 'border-purple-500 bg-purple-50' : 'hover:border-gray-400'
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item, index) => (
            <DraggableVisionItem
              key={item.id}
              item={item}
              index={index}
              quadrant={quadrant}
            />
          ))}
        </div>
        
        {/* Add button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-purple-500 hover:bg-purple-50 transition-colors"
        >
          <Plus className="w-6 h-6 text-gray-400" />
        </button>
      </div>
    );
  };

  // Get items by quadrant
  const getQuadrantItems = (quadrant: string) => {
    return visionItems.filter(item => item.quadrant === quadrant);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vision Board</h1>
                <p className="text-gray-600">Visualize your dreams and goals</p>
              </div>
              
              <div className="flex items-center space-x-4">
                {lastSaved && (
                  <span className="text-sm text-gray-500">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <StickyNote className="w-4 h-4" />
                  <span>Notes</span>
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Completion: {stats.completionPercentage}%
                </span>
                <span className="text-sm text-gray-500">
                  {stats.itemsWithCustomContent} of {stats.totalItems} items customized
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Controls */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Add text element..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={addText}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Add Text</span>
                </button>
              </div>

              <button
                onClick={() => setIsCollageEditMode(!isCollageEditMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isCollageEditMode 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isCollageEditMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{isCollageEditMode ? 'Exit Edit' : 'Edit Mode'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportData}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={() => importInputRef.current?.click()}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              
              <button
                onClick={handleClearAllData}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Vision Board Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DroppableQuadrant
              quadrant="business"
              title="Business & Career"
              items={getQuadrantItems('business')}
            />
            <DroppableQuadrant
              quadrant="body"
              title="Health & Body"
              items={getQuadrantItems('body')}
            />
            <DroppableQuadrant
              quadrant="balance"
              title="Life Balance"
              items={getQuadrantItems('balance')}
            />
            <DroppableQuadrant
              quadrant="feelings"
              title="Emotions & Feelings"
              items={getQuadrantItems('feelings')}
            />
          </div>

          {/* Text Elements */}
          {textElements.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Text Elements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {textElements.map(text => (
                  <div
                    key={text.id}
                    className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 group"
                  >
                    {editingText === text.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={text.text}
                          onChange={(e) => updateTextContent(text.id, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded resize-none"
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingText(null)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingText(null)}
                            className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-800 mb-2">{text.text}</p>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingText(text.id)}
                            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(text.id, 'text')}
                            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          onChange={handleImportData}
          className="hidden"
        />

        {/* Edit Card Modal */}
        {editingCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Vision Item</h3>
              {(() => {
                const card = visionItems.find(item => item.id === editingCard);
                if (!card) return null;
                
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => updateCard(editingCard, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={card.description}
                        onChange={(e) => updateCard(editingCard, { description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meaning</label>
                      <textarea
                        value={card.meaning || ''}
                        onChange={(e) => updateCard(editingCard, { meaning: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={2}
                        placeholder="What does this represent to you?"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Feeling</label>
                      <input
                        type="text"
                        value={card.feeling || ''}
                        onChange={(e) => updateCard(editingCard, { feeling: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="How does this make you feel?"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => setEditingCard(null)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          saveData();
                          setEditingCard(null);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Notes Panel */}
        {showNotes && (
          <NotesPanel
            isOpen={showNotes}
            onClose={() => setShowNotes(false)}
            feature="vision"
          />
        )}
      </div>
    </DndProvider>
  );
};

export default VisionBoard;