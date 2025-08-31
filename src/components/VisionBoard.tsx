import React, { useState, useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Camera, Type, Upload, X, FlipHorizontal, Save, Download, RotateCcw, Edit3, Check, Plus, Minus } from 'lucide-react';

interface VisionItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  quadrant: 'business' | 'body' | 'balance' | 'feelings';
  position?: { x: number; y: number };
  meaning?: string;
  feeling?: string;
  isFlipped?: boolean;
  size?: 'small' | 'medium' | 'large';
}

interface TextElement {
  id: string;
  text: string;
  position: { x: number; y: number };
  className: string;
  color?: string;
}

const STORAGE_KEY = 'coach-pack-vision-board';

const defaultVisionItems: VisionItem[] = [
  {
    id: '1',
    title: 'Dream Office Space',
    description: 'A inspiring workspace that fuels creativity',
    imageUrl: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400',
    quadrant: 'business',
    position: { x: 50, y: 80 },
    meaning: '',
    feeling: '',
    isFlipped: false,
    size: 'medium'
  },
  {
    id: '2',
    title: 'Mountain Adventure',
    description: 'Conquering peaks and pushing physical limits',
    imageUrl: 'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=400',
    quadrant: 'body',
    position: { x: 150, y: 80 },
    meaning: '',
    feeling: '',
    isFlipped: false,
    size: 'medium'
  },
  {
    id: '3',
    title: 'Family Time',
    description: 'Quality moments with loved ones',
    imageUrl: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400',
    quadrant: 'balance',
    position: { x: 250, y: 80 },
    meaning: '',
    feeling: '',
    isFlipped: false,
    size: 'medium'
  },
  {
    id: '4',
    title: 'Inner Peace',
    description: 'Finding calm and contentment within',
    imageUrl: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400',
    quadrant: 'feelings',
    position: { x: 350, y: 80 },
    meaning: '',
    feeling: '',
    isFlipped: false,
    size: 'medium'
  }
];

const SAMPLE_IMAGES = [
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400'
];

const INSPIRING_PHRASES = [
  "This feeling drives me forward",
  "I am becoming this person", 
  "This is my daily reality",
  "I live this truth",
  "This energy flows through me",
  "I embody this vision"
];

const VisionBoard: React.FC = () => {
  const [visionItems, setVisionItems] = useState<VisionItem[]>(defaultVisionItems);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [newText, setNewText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.visionItems) setVisionItems(data.visionItems);
        if (data.textElements) setTextElements(data.textElements);
        if (data.uploadedImages) setUploadedImages(data.uploadedImages);
        setLastSaved(new Date(data.lastUpdated));
      }
    } catch (error) {
      console.error('Failed to load vision board data:', error);
    }
  }, []);

  // Auto-save function
  const saveData = useCallback(() => {
    try {
      const data = {
        visionItems,
        textElements,
        uploadedImages,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save vision board data:', error);
    }
  }, [visionItems, textElements, uploadedImages]);

  // Auto-save whenever data changes
  React.useEffect(() => {
    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [visionItems, textElements, uploadedImages, saveData]);

  const addVisionItem = useCallback((imageUrl: string, quadrant: string = 'business') => {
    const newItem: VisionItem = {
      id: Date.now().toString(),
      title: 'New Vision Item',
      description: 'Click to edit description',
      imageUrl,
      quadrant: quadrant as any,
      position: { x: Math.random() * 300, y: Math.random() * 200 + 100 },
      meaning: '',
      feeling: '',
      isFlipped: false,
      size: 'medium'
    };
    
    setVisionItems(prev => [...prev, newItem]);
    return newItem.id;
  }, []);

  const updateVisionItem = useCallback((itemId: string, updates: Partial<VisionItem>) => {
    setVisionItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  }, []);

  const removeVisionItem = useCallback((itemId: string) => {
    setVisionItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const addTextElement = useCallback((text: string) => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text,
      position: { x: Math.random() * 300 + 50, y: Math.random() * 100 + 150 },
      className: 'text-base',
      color: '#1e293b'
    };
    setTextElements(prev => [...prev, newText]);
    return newText.id;
  }, []);

  const updateTextElement = useCallback((textId: string, updates: Partial<TextElement>) => {
    setTextElements(prev => prev.map(text => 
      text.id === textId ? { ...text, ...updates } : text
    ));
  }, []);

  const removeTextElement = useCallback((textId: string) => {
    setTextElements(prev => prev.filter(text => text.id !== textId));
  }, []);

  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          const imageUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          setUploadedImages(prev => [...prev, imageUrl]);
          addVisionItem(imageUrl);
        }
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
      alert('Failed to upload some images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [addVisionItem]);

  const handleExportData = useCallback(() => {
    const data = {
      visionItems,
      textElements,
      uploadedImages,
      lastUpdated: new Date().toISOString()
    };
    
    const dataString = JSON.stringify(data, null, 2);
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vision-board-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [visionItems, textElements, uploadedImages]);

  const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.visionItems) setVisionItems(data.visionItems);
        if (data.textElements) setTextElements(data.textElements);
        if (data.uploadedImages) setUploadedImages(data.uploadedImages);
        
        alert('Vision board data imported successfully!');
      } catch (error) {
        console.error('Failed to import data:', error);
        alert('Invalid file format. Please select a valid vision board export file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, []);

  const clearAllData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all your vision board data? This action cannot be undone.')) {
      setVisionItems(defaultVisionItems);
      setTextElements([]);
      setUploadedImages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const getQuadrantItems = (quadrantId: string) => {
    return visionItems.filter(item => item.quadrant === quadrantId);
  };

  const quadrants = [
    { id: 'business', name: 'Business & Career', icon: '💼', color: 'border-purple-300 bg-purple-50' },
    { id: 'body', name: 'Health & Body', icon: '💪', color: 'border-green-300 bg-green-50' },
    { id: 'balance', name: 'Life Balance', icon: '⚖️', color: 'border-blue-300 bg-blue-50' },
    { id: 'feelings', name: 'Emotions & Growth', icon: '❤️', color: 'border-pink-300 bg-pink-50' }
  ];

  return (
    <DndProvider backend={HTML5Backend}>
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
                onClick={clearAllData}
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
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newText.trim()) {
                  addTextElement(newText.trim());
                  setNewText('');
                }
              }}
              className="bg-transparent outline-none placeholder-slate-400 font-medium text-slate-700 w-48"
            />
          </div>
        </div>

        {/* Vision Board Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {quadrants.map((quadrant) => {
            const items = getQuadrantItems(quadrant.id);
            
            return (
              <div key={quadrant.id} className={`min-h-96 p-6 border-2 border-dashed rounded-2xl ${quadrant.color} transition-all duration-200`}>
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-2xl">{quadrant.icon}</span>
                  <h3 className="text-xl font-semibold text-slate-800">{quadrant.name}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="group relative">
                      <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                          }}
                        />
                        
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                            <button
                              onClick={() => setEditingCard(item.id)}
                              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Edit3 className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              onClick={() => updateVisionItem(item.id, { isFlipped: !item.isFlipped })}
                              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <FlipHorizontal className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              onClick={() => removeVisionItem(item.id)}
                              className="p-2 bg-white rounded-full hover:bg-red-100 transition-colors"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="font-medium text-slate-900">{item.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                  
                  {items.length === 0 && (
                    <div className="col-span-full text-center py-8 text-slate-500">
                      <span className="text-4xl mb-3 block">{quadrant.icon}</span>
                      <p className="mb-3">No vision items yet</p>
                      <button
                        onClick={() => setShowImageOptions(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Add your first vision card
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Text Elements Display */}
        {textElements.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Inspiring Text</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {textElements.map(text => (
                <div
                  key={text.id}
                  className="p-4 bg-slate-50 rounded-lg group relative"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-slate-800 flex-1" style={{ color: text.color }}>
                      {text.text}
                    </p>
                    <button
                      onClick={() => removeTextElement(text.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                          onClick={() => addVisionItem(imageUrl)}
                          className="aspect-square rounded-xl overflow-hidden hover:scale-105 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-300 w-full"
                        >
                          <img src={imageUrl} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                        <button
                          onClick={() => setUploadedImages(prev => prev.filter(img => img !== imageUrl))}
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
                      onClick={() => addVisionItem(url)}
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
        {newText === '' && visionItems.length > 0 && textElements.length === 0 && (
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-3">Quick add inspiring text:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {INSPIRING_PHRASES.map((phrase, index) => (
                <button
                  key={index}
                  onClick={() => addTextElement(phrase)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default VisionBoard;