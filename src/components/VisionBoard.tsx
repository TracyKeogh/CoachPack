import React, { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Plus, Upload, Edit3, Trash2, Save, Grid3X3, Layout, X, Check, Image as ImageIcon, Move, Download, RotateCcw } from 'lucide-react';
import { useVisionBoardData, type VisionItem, type TextElement } from '../hooks/useVisionBoardData';

interface EditingItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface DraggableVisionItemProps {
  item: VisionItem;
  index: number;
  quadrantId: string;
  onMove: (dragIndex: number, hoverIndex: number, sourceQuadrant: string, targetQuadrant: string) => void;
  onPositionUpdate: (itemId: string, position: { x: number; y: number }) => void;
  isCollageMode?: boolean;
}

const DraggableVisionItem: React.FC<DraggableVisionItemProps> = ({ 
  item, 
  index, 
  quadrantId, 
  onMove, 
  onPositionUpdate,
  isCollageMode = false 
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'vision-item',
    item: { 
      id: item.id, 
      index, 
      quadrant: quadrantId,
      isCollageMode 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'vision-item',
    hover: (draggedItem: { id: string; index: number; quadrant: string; isCollageMode: boolean }) => {
      if (draggedItem.isCollageMode !== isCollageMode) return;
      
      if (draggedItem.index !== index || draggedItem.quadrant !== quadrantId) {
        onMove(draggedItem.index, index, draggedItem.quadrant, quadrantId);
        draggedItem.index = index;
        draggedItem.quadrant = quadrantId;
      }
    },
  });

  const handleDragEnd = (event: React.DragEvent) => {
    if (isCollageMode) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      onPositionUpdate(item.id, { x, y });
    }
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`relative group cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
      } ${isCollageMode ? 'absolute' : ''}`}
      style={isCollageMode && item.position ? {
        left: item.position.x,
        top: item.position.y,
        zIndex: isDragging ? 1000 : 1
      } : {}}
      onDragEnd={handleDragEnd}
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        className={`object-cover rounded-lg shadow-sm ${
          isCollageMode ? 'w-20 h-20' : 'w-full h-24'
        }`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'https://images.pexels.com/photos/220301/pexels-photo-220301.jpeg?auto=compress&cs=tinysrgb&w=400';
        }}
      />
      
      {/* Overlay with title and move indicator */}
      <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 rounded-lg flex items-center justify-center ${
        isCollageMode ? 'flex-col' : ''
      }`}>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
          <Move className="w-4 h-4 text-white mx-auto mb-1" />
          <span className="text-white text-xs font-medium px-2">
            {item.title}
          </span>
        </div>
      </div>
    </div>
  );
};

interface DraggableTextProps {
  text: string;
  id: string;
  position: { x: number; y: number };
  onPositionUpdate: (id: string, position: { x: number; y: number }) => void;
  onEdit: (id: string, newText: string) => void;
  onRemove: (id: string) => void;
  className?: string;
}

const DraggableText: React.FC<DraggableTextProps> = ({ 
  text, 
  id, 
  position, 
  onPositionUpdate, 
  onEdit,
  onRemove,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const [{ isDragging }, drag] = useDrag({
    type: 'text-element',
    item: { id, type: 'text' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleDragEnd = (event: React.DragEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    onPositionUpdate(id, { x, y });
  };

  const handleSaveEdit = () => {
    onEdit(id, editText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(text);
    setIsEditing(false);
  };

  return (
    <div
      ref={drag}
      className={`absolute cursor-move group ${className}`}
      style={{
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 1000 : 2
      }}
      onDragEnd={handleDragEnd}
    >
      {isEditing ? (
        <div className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-lg border">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="text-sm font-semibold text-slate-700 bg-transparent border-none outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            autoFocus
          />
          <button
            onClick={handleSaveEdit}
            className="text-green-600 hover:text-green-700"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          className={`bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm border transition-all duration-200 ${
            isDragging ? 'opacity-50' : 'group-hover:shadow-md'
          }`}
          onDoubleClick={() => setIsEditing(true)}
        >
          <span className="text-sm font-semibold text-slate-700">{text}</span>
          <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            <button
              onClick={() => onRemove(id)}
              className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
            >
              <X className="w-2 h-2" />
            </button>
            <Move className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      )}
    </div>
  );
};

const VisionBoard: React.FC = () => {
  const {
    visionItems,
    textElements,
    isCollageEditMode,
    isLoaded,
    lastSaved,
    addVisionItem,
    updateVisionItem,
    removeVisionItem,
    moveVisionItem,
    updateItemPosition,
    getQuadrantItems,
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

  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  
  // Curated stock photos for different categories
  const stockPhotos = {
    business: [
      'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    body: [
      'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    balance: [
      'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1128317/pexels-photo-1128317.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1128316/pexels-photo-1128316.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1128319/pexels-photo-1128319.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1128320/pexels-photo-1128320.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1128321/pexels-photo-1128321.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    feelings: [
      'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1051837/pexels-photo-1051837.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1051839/pexels-photo-1051839.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1051840/pexels-photo-1051840.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1051841/pexels-photo-1051841.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1051842/pexels-photo-1051842.jpeg?auto=compress&cs=tinysrgb&w=400'
    ]
  };

  const quadrants = [
    {
      id: 'business',
      title: 'Business & Career',
      description: 'Professional goals and achievements',
      color: 'border-purple-300 bg-purple-50',
      icon: '💼'
    },
    {
      id: 'body',
      title: 'Health & Body',
      description: 'Physical wellness and fitness goals',
      color: 'border-green-300 bg-green-50',
      icon: '💪'
    },
    {
      id: 'balance',
      title: 'Life Balance',
      description: 'Relationships and lifestyle balance',
      color: 'border-blue-300 bg-blue-50',
      icon: '⚖️'
    },
    {
      id: 'feelings',
      title: 'Emotions & Growth',
      description: 'Personal development and emotional well-being',
      color: 'border-pink-300 bg-pink-50',
      icon: '❤️'
    }
  ];

  const startEditing = (item: VisionItem) => {
    setEditingItem({
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl
    });
  };

  const saveEdit = () => {
    if (!editingItem) return;
    
    updateVisionItem(editingItem.id, {
      title: editingItem.title,
      description: editingItem.description,
      imageUrl: editingItem.imageUrl
    });
    setEditingItem(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setShowImageSelector(false);
  };

  const selectStockPhoto = (imageUrl: string) => {
    if (editingItem) {
      setEditingItem(prev => prev ? { ...prev, imageUrl } : null);
    }
    setShowImageSelector(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingItem) return;

    // Create a local URL for the uploaded file
    const imageUrl = URL.createObjectURL(file);
    setEditingItem(prev => prev ? { ...prev, imageUrl } : null);
    setShowImageSelector(false);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportData = () => {
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
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importData(content)) {
        alert('Vision board data imported successfully!');
      } else {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all your vision board data? This action cannot be undone.')) {
      clearAllData();
    }
  };

  const getCurrentQuadrantPhotos = () => {
    if (!editingItem) return [];
    const item = visionItems.find(v => v.id === editingItem.id);
    if (!item) return [];
    return stockPhotos[item.quadrant as keyof typeof stockPhotos] || [];
  };

  const stats = getCompletionStats();

  // Early return if not loaded yet
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
          <button className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <Layout className="w-4 h-4" />
            <span>Template</span>
          </button>
          <button 
            onClick={saveData}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-2">Your Progress</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-slate-500">Total Items</div>
                <div className="font-semibold text-slate-900">{stats.totalItems}</div>
              </div>
              <div>
                <div className="text-slate-500">Customized</div>
                <div className="font-semibold text-slate-900">{stats.itemsWithCustomContent}</div>
              </div>
              <div>
                <div className="text-slate-500">Custom Text</div>
                <div className="font-semibold text-slate-900">{stats.customTextElements}</div>
              </div>
              <div>
                <div className="text-slate-500">Completion</div>
                <div className="font-semibold text-slate-900">{stats.completionPercentage}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vision Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {quadrants.map((quadrant) => {
          const items = getQuadrantItems(quadrant.id);
          
          return (
            <div
              key={quadrant.id}
              className={`rounded-2xl border-2 border-dashed p-6 min-h-96 ${quadrant.color} transition-all duration-200 hover:shadow-lg`}
            >
              {/* Quadrant Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{quadrant.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{quadrant.title}</h3>
                    <p className="text-sm text-slate-600">{quadrant.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => addVisionItem(quadrant.id)}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Vision Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item, index) => (
                  <div key={item.id}>
                    <DraggableVisionItem
                      item={item}
                      index={index}
                      quadrantId={quadrant.id}
                      onMove={moveVisionItem}
                      onPositionUpdate={updateItemPosition}
                    />
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group mt-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEditing(item)}
                              className="p-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                startEditing(item);
                                setShowImageSelector(true);
                              }}
                              className="p-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeVisionItem(item.id)}
                              className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New Item Placeholder */}
                {items.length === 0 && (
                  <div
                    onClick={() => addVisionItem(quadrant.id)}
                    className="border-2 border-dashed border-slate-300 rounded-lg h-32 flex flex-col items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-400 cursor-pointer transition-all"
                  >
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Add Vision Item</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Edit Vision Item</h3>
              <button
                onClick={cancelEdit}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={editingItem.imageUrl}
                  alt={editingItem.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/220301/pexels-photo-220301.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
                <button
                  onClick={() => setShowImageSelector(!showImageSelector)}
                  className="absolute top-2 right-2 p-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Image Selector */}
              {showImageSelector && (
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-4">Choose Image</h4>
                  
                  {/* Upload Option */}
                  <div className="mb-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Your Own Image</span>
                    </button>
                  </div>

                  {/* Stock Photos */}
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-3">Or choose from stock photos:</h5>
                    <div className="grid grid-cols-3 gap-3">
                      {getCurrentQuadrantPhotos().map((photoUrl, index) => (
                        <button
                          key={index}
                          onClick={() => selectStockPhoto(photoUrl)}
                          className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                            editingItem.imageUrl === photoUrl
                              ? 'border-purple-500 ring-2 ring-purple-200'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img
                            src={photoUrl}
                            alt={`Stock photo ${index + 1}`}
                            className="w-full h-20 object-cover"
                          />
                          {editingItem.imageUrl === photoUrl && (
                            <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                              <Check className="w-5 h-5 text-purple-600" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter a title for your vision item"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe what this vision means to you"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Vision Summary with Combined Image Collage */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900">Your Interactive Vision Collage</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCollageEditMode(!isCollageEditMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isCollageEditMode 
                  ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Move className="w-4 h-4" />
              <span>{isCollageEditMode ? 'Exit Edit Mode' : 'Edit Layout'}</span>
            </button>
            {isCollageEditMode && (
              <button
                onClick={addTextElement}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-300"
              >
                <Plus className="w-4 h-4" />
                <span>Add Text</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Interactive Collage Canvas */}
        <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden" style={{ height: '500px' }}>
          {isCollageEditMode && (
            <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium z-10">
              🎨 Edit Mode: Drag images and text to rearrange • Double-click text to edit
            </div>
          )}
          
          {visionItems.length > 0 ? (
            <>
              {/* Draggable Images */}
              {visionItems.map((item, index) => (
                <DraggableVisionItem
                  key={item.id}
                  item={item}
                  index={index}
                  quadrantId={item.quadrant}
                  onMove={moveVisionItem}
                  onPositionUpdate={updateItemPosition}
                  isCollageMode={true}
                />
              ))}
              
              {/* Draggable Text Elements */}
              {isCollageEditMode && textElements.map((textElement) => (
                <DraggableText
                  key={textElement.id}
                  text={textElement.text}
                  id={textElement.id}
                  position={textElement.position}
                  onPositionUpdate={updateTextPosition}
                  onEdit={updateTextContent}
                  onRemove={removeTextElement}
                  className={textElement.className}
                />
              ))}
              
              {/* Static Text Elements (when not in edit mode) */}
              {!isCollageEditMode && textElements.map((textElement) => (
                <div
                  key={textElement.id}
                  className="absolute bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm border"
                  style={{
                    left: textElement.position.x,
                    top: textElement.position.y,
                    zIndex: 2
                  }}
                >
                  <span className={`text-slate-700 ${textElement.className}`}>{textElement.text}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h4 className="text-lg font-semibold text-slate-700 mb-2">Your Vision Awaits</h4>
                <p className="text-slate-500">Add vision items to see your interactive collage</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
          <p className="text-purple-800 font-medium">💡 Interactive Vision Collage</p>
          <p className="text-purple-700 text-sm mt-1">
            Click "Edit Layout" to rearrange your vision elements freely. Drag images and text around to create your perfect vision board layout. Double-click text to edit it directly. All changes are automatically saved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisionBoard;