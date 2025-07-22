import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Heart, X, ArrowLeft, ArrowRight, RotateCcw, Check, Move, 
  Undo, ChevronUp, ChevronDown, Download, Save, Upload 
} from 'lucide-react';
import { allValues, type Value } from '../data/values';
import { useValuesData } from '../hooks/useValuesData';

// Group values into families for step 3
const valueFamilies = {
  "Achievement & Growth": ["Achievement", "Ambition", "Excellence", "Growth", "Mastery", "Performance", "Progress", "Drive"],
  "Connection & Love": ["Love", "Family", "Friendship", "Connection", "Community", "Intimacy", "Belonging", "Care", "Compassion"],
  "Integrity & Character": ["Honesty", "Integrity", "Authenticity", "Ethics", "Honor", "Dignity", "Respect", "Responsibility", "Accountability"],
  "Freedom & Independence": ["Freedom", "Independence", "Self-reliance", "Flexibility", "Adventure", "Exploration"],
  "Peace & Balance": ["Peace", "Balance", "Harmony", "Calm", "Mindfulness", "Stability", "Contentment", "Simplicity"],
  "Creativity & Expression": ["Creativity", "Expressiveness", "Innovation", "Imagination", "Originality", "Beauty"],
  "Service & Impact": ["Service", "Altruism", "Contribution", "Impact", "Justice", "Giving", "Helpfulness", "Legacy", "Purpose"],
  "Health & Vitality": ["Health", "Energy", "Vitality"],
  "Wisdom & Learning": ["Wisdom", "Learning", "Knowledge", "Education", "Curiosity", "Discovery", "Awareness"],
  "Security & Stability": ["Security", "Safety", "Stability", "Order", "Organization", "Control", "Reliability"]
};

const ValuesClarity: React.FC = () => {
  const {
    data,
    isLoaded,
    lastSaved,
    updateCurrentStep,
    updateSelectedValues,
    updateCoreValues,
    updateSupportingValues,
    updateRankedCoreValues,
    updateValueDefinitions,
    saveData,
    getCompletionStats,
    exportData,
    importData,
    clearAllData
  } = useValuesData();

  // New card-deck state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [yesValues, setYesValues] = useState<string[]>([]);
  const [noValues, setNoValues] = useState<string[]>([]);
  const [groupedValues, setGroupedValues] = useState<Record<string, string[]>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [draggedValue, setDraggedValue] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Card dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showDataManagement, setShowDataManagement] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Shuffle values for the card deck
  const [shuffledValues] = useState(() => 
    allValues.map(v => v.name).sort(() => Math.random() - 0.5)
  );

  // Convert string values back to Value objects
  const convertToValueObjects = (valueNames: string[]): Value[] => {
    return valueNames.map(name => allValues.find(v => v.name === name)!).filter(Boolean);
  };

  // Step 1: Handle card dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (data.currentStep !== 1) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  }, [isDragging, startPos]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    const threshold = 120;
    if (Math.abs(dragOffset.x) > threshold) {
      handleSwipe(dragOffset.x > 0 ? 'yes' : 'no');
    }
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, [isDragging, dragOffset]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Step 1: Binary Swipe (Yes/No)
  const handleSwipe = useCallback((choice: 'yes' | 'no') => {
    if (isAnimating || data.currentStep !== 1) return;
    
    setIsAnimating(true);
    setSwipeDirection(choice === 'yes' ? 'right' : 'left');

    const currentValue = shuffledValues[currentCardIndex];
    
    if (choice === 'yes') {
      setYesValues(prev => [...prev, currentValue]);
    } else {
      setNoValues(prev => [...prev, currentValue]);
    }

    setTimeout(() => {
      if (currentCardIndex < shuffledValues.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        // Move to step 2 and convert to existing data structure
        const yesValueObjects = convertToValueObjects([...yesValues, currentValue]);
        updateSelectedValues(yesValueObjects);
        updateCurrentStep(2);
      }
      
      setIsAnimating(false);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 300);
  }, [isAnimating, currentCardIndex, shuffledValues, yesValues, updateSelectedValues, updateCurrentStep]);

  // Undo last selection
  const undoLastSelection = () => {
    if (currentCardIndex > 0) {
      const lastValue = shuffledValues[currentCardIndex - 1];
      setYesValues(prev => prev.filter(v => v !== lastValue));
      setNoValues(prev => prev.filter(v => v !== lastValue));
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  // Step 2: Prioritization
  const toggleValueSelection = (value: Value) => {
    if (data.selectedValues.some(v => v.id === value.id)) {
      updateSelectedValues(data.selectedValues.filter(v => v.id !== value.id));
    } else if (data.selectedValues.length < 20) {
      updateSelectedValues([...data.selectedValues, value]);
    }
  };

  // Step 3: Group into families and proceed to existing step structure
  const groupIntoFamilies = () => {
    const grouped: Record<string, string[]> = {};
    
    Object.entries(valueFamilies).forEach(([family, familyValues]) => {
      const matchedValues = data.selectedValues.filter(value => 
        familyValues.includes(value.name)
      );
      if (matchedValues.length > 0) {
        grouped[family] = matchedValues.map(v => v.name);
      }
    });

    // Handle ungrouped values
    const groupedFlat = Object.values(grouped).flat();
    const ungrouped = data.selectedValues.filter(value => !groupedFlat.includes(value.name));
    if (ungrouped.length > 0) {
      grouped["Other Important Values"] = ungrouped.map(v => v.name);
    }

    setGroupedValues(grouped);
    
    // Auto-populate core and supporting values for compatibility
    updateCoreValues(data.selectedValues.slice(0, Math.min(9, data.selectedValues.length)));
    updateSupportingValues(data.selectedValues.slice(9, Math.min(12, data.selectedValues.length)));
    updateCurrentStep(3);
  };

  // Step 4: Drag and drop ranking
  const handleDragStart = (e: React.DragEvent, value: Value, index: number) => {
    setDraggedValue(value.name);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (draggedValue) {
      const currentIndex = data.rankedCoreValues.findIndex(v => v.name === draggedValue);
      if (currentIndex === -1) return;
      
      const newRanked = [...data.rankedCoreValues];
      const [removed] = newRanked.splice(currentIndex, 1);
      newRanked.splice(targetIndex, 0, removed);
      
      updateRankedCoreValues(newRanked);
    }
    
    setDraggedValue(null);
    setDragOverIndex(null);
  };

  // Move value up/down in ranking
  const moveValue = (fromIndex: number, toIndex: number) => {
    const newRanked = [...data.rankedCoreValues];
    const [removed] = newRanked.splice(fromIndex, 1);
    newRanked.splice(toIndex, 0, removed);
    updateRankedCoreValues(newRanked);
  };

  const moveUp = (index: number) => {
    if (index > 0) moveValue(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index < data.rankedCoreValues.length - 1) moveValue(index, index + 1);
  };

  // Initialize ranking step
  const initializeRanking = () => {
    if (data.coreValues.length > 0) {
      updateRankedCoreValues([...data.coreValues]);
    }
    updateCurrentStep(4);
  };

  // Complete the process and advance to definitions step
  const completeRanking = () => {
    updateCurrentStep(5);
  };

  // Navigation helpers
  const canProceed = () => {
    switch (data.currentStep) {
      case 1:
        return currentCardIndex >= shuffledValues.length - 1;
      case 2:
        return data.selectedValues.length > 0;
      case 3:
        return data.coreValues.length > 0;
      case 4:
        return data.rankedCoreValues.length > 0;
      case 5:
        return data.rankedCoreValues.slice(0, 3).every(value => 
          data.valueDefinitions[value.id]?.meaning?.trim() && 
          data.valueDefinitions[value.id]?.behavior?.trim()
        );
      default:
        return false;
    }
  };

  const proceedToNextStep = () => {
    if (data.currentStep === 2) {
      groupIntoFamilies();
    } else if (data.currentStep === 3) {
      initializeRanking();
    } else if (data.currentStep === 4) {
      completeRanking();
    } else {
      updateCurrentStep(data.currentStep + 1);
    }
  };

  // Data management
  const handleExportData = () => {
    const dataString = exportData();
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `values-clarity-${new Date().toISOString().split('T')[0]}.json`;
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
        alert('Values data imported successfully!');
      } else {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all your values data? This action cannot be undone.')) {
      clearAllData();
      setCurrentCardIndex(0);
      setYesValues([]);
      setNoValues([]);
      setGroupedValues({});
    }
  };

  // Restart process
  const restart = () => {
    setCurrentCardIndex(0);
    setYesValues([]);
    setNoValues([]);
    setGroupedValues({});
    updateCurrentStep(1);
    updateSelectedValues([]);
    updateCoreValues([]);
    updateSupportingValues([]);
    updateRankedCoreValues([]);
  };

  const currentCard = shuffledValues[currentCardIndex];
  const progress = data.currentStep === 1 ? ((currentCardIndex + 1) / shuffledValues.length) * 100 : 100;

  // Calculate swipe progress for visual feedback
  const swipeProgress = Math.min(Math.abs(dragOffset.x) / 120, 1);
  const cardRotation = dragOffset.x * 0.1;

  const steps = [
    { number: 1, title: 'Card Discovery', description: 'Swipe through values to find what resonates' },
    { number: 2, title: 'Prioritization', description: 'Select your most important values' },
    { number: 3, title: 'Value Families', description: 'See how your values group together' },
    { number: 4, title: 'Final Ranking', description: 'Rank your core values by importance' },
    { number: 5, title: 'Define & Envision', description: 'Make your top values actionable' },
  ];

  // Early return if not loaded yet
  if (!isLoaded) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Your Values Journey...</h2>
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
          <h1 className="text-3xl font-bold text-slate-900">Values Clarification</h1>
          <p className="text-slate-600 mt-2">
            Discover your core values through guided reflection and structured exploration
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
            <Save className="w-4 h-4" />
            <span>Manage Data</span>
          </button>
        </div>
      </div>

      {/* Data Management Panel */}
      {showDataManagement && (
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Management</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
            
            <button
              onClick={() => importInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import Data</span>
            </button>
            
            <button
              onClick={handleClearAllData}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear All Data</span>
            </button>
            
            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Progress and Steps */}
      <div className="text-center">
        <div className="flex justify-center space-x-4 mb-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                step.number <= data.currentStep
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step.number < data.currentStep ? <Check className="w-5 h-5" /> : step.number}
            </div>
          ))}
        </div>
        
        <div className="flex justify-center space-x-8 text-sm text-slate-600">
          {steps.map((step) => (
            <span key={step.number} className={data.currentStep === step.number ? 'font-medium text-purple-600' : ''}>
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step 1: Binary Swipe with Piles */}
      {data.currentStep === 1 && (
        <div className="space-y-6">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-center text-sm text-slate-600 mb-4">
            Card {currentCardIndex + 1} of {shuffledValues.length}
          </div>

          <div className="grid grid-cols-5 gap-8 items-start">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {data.selectedValues.map((value, index) => (
                  <span
                    key={value.id}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium"
                  >
                    <span className="w-5 h-5 bg-white text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span>{value.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={proceedToNextStep}
              disabled={data.selectedValues.length === 0}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              Continue to Grouping
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Value Families */}
      {data.currentStep === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Your Value Families
            </h2>
            <p className="text-slate-600">
              See how your values naturally group together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedValues).map(([family, values]) => (
              <div
                key={family}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {family}
                </h3>
                <div className="space-y-2">
                  {values.map((value) => (
                    <div
                      key={value}
                      className="px-3 py-2 bg-slate-50 rounded-lg text-slate-700"
                    >
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={proceedToNextStep}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Proceed to Final Ranking
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Drag & Drop Ranking */}
      {data.currentStep === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Rank Your Values
            </h2>
            <p className="text-slate-600">
              Drag and drop to arrange your values by importance. Your top 3 will be your core values.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            {data.rankedCoreValues.map((value, index) => (
              <div
                key={value.id}
                draggable
                onDragStart={(e) => handleDragStart(e, value, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-200 cursor-move hover:shadow-md ${
                  index < 3
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-white border-slate-200'
                } ${
                  dragOverIndex === index ? 'border-purple-400 bg-purple-100' : ''
                } ${
                  draggedValue === value.name ? 'opacity-50 scale-95' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Move className="w-4 h-4 text-slate-400" />
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === data.rankedCoreValues.length - 1}
                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index < 3
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-slate-900">{value.name}</span>
                    <p className="text-sm text-slate-600">{value.description}</p>
                  </div>
                  {index < 3 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                      CORE
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={restart}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Start Over
            </button>
            
            <button
              onClick={proceedToNextStep}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue to Definitions
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          </div>

          <div className="max-w-md mx-auto mt-8 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
            <h3 className="text-lg font-semibold text-center text-slate-900 mb-4">
              Your Top 3 Core Values
            </h3>
            <div className="space-y-3">
              {data.rankedCoreValues.slice(0, 3).map((value, index) => (
                <div key={value.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="text-slate-900 font-medium">{value.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Define & Envision */}
      {data.currentStep === 5 && (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Define & Envision Your Top 3 Values
            </h2>
            <p className="text-slate-600">
              Make your values actionable by defining what they mean to you and how you live them
            </p>
          </div>

          <div className="space-y-8">
            {data.rankedCoreValues.slice(0, 3).map((value, index) => (
              <div key={value.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{value.name}</h3>
                    <p className="text-slate-600">{value.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      What does this mean to you?
                    </label>
                    <textarea
                      value={data.valueDefinitions[value.id]?.meaning || ''}
                      onChange={(e) => updateValueDefinitions(value.id, { 
                        ...data.valueDefinitions[value.id],
                        meaning: e.target.value 
                      })}
                      placeholder="Define what this value means in your own words..."
                      className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      What does it look like when you live this value?
                    </label>
                    <textarea
                      value={data.valueDefinitions[value.id]?.behavior || ''}
                      onChange={(e) => updateValueDefinitions(value.id, { 
                        ...data.valueDefinitions[value.id],
                        behavior: e.target.value 
                      })}
                      placeholder="Describe specific behaviors, actions, or decisions..."
                      className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
            <h3 className="text-2xl font-bold text-center text-slate-900 mb-6">
              Your Values Journey Complete! 🎉
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{data.rankedCoreValues.length}</div>
                <div className="text-sm text-slate-600">Values Identified</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
                <div className="text-sm text-slate-600">Core Values Defined</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Object.keys(data.valueDefinitions).filter(id => 
                    data.valueDefinitions[id]?.meaning?.trim() && 
                    data.valueDefinitions[id]?.behavior?.trim()
                  ).length}
                </div>
                <div className="text-sm text-slate-600">Values Fully Defined</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-700 mb-4">
                Your core values are now clear and actionable. Use them to guide important decisions, 
                set meaningful goals, and create a life that feels authentic and fulfilling.
              </p>
              <div className="text-sm text-slate-500">
                These values will be available throughout Coach Pack to inform your vision board, 
                goals, and daily planning.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={() => updateCurrentStep(Math.max(1, data.currentStep - 1))}
          disabled={data.currentStep === 1}
          className="flex items-center space-x-2 px-6 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-sm text-slate-500">
          Step {data.currentStep} of {steps.length}
        </div>

        <button
          onClick={proceedToNextStep}
          disabled={!canProceed()}
          className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>{data.currentStep === 5 ? 'Complete' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
  );

export default ValuesClarity;text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-red-800">Not Important</h3>
                <p className="text-sm text-red-600">{noValues.length} values</p>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {noValues.slice(-5).map((value, index) => (
                  <div
                    key={value}
                    className="px-3 py-2 bg-red-50 text-red-800 rounded-lg text-sm text-center border border-red-200"
                  >
                    {value}
                  </div>
                ))}
                {noValues.length > 5 && (
                  <div className="text-xs text-red-500 text-center">
                    +{noValues.length - 5} more
                  </div>
                )}
              </div>
            </div>

            <div></div>

            <div className="relative h-96 flex items-center justify-center">
              {currentCardIndex < shuffledValues.length && (
                <div
                  onMouseDown={handleMouseDown}
                  className={`w-80 h-80 bg-white rounded-2xl shadow-lg border-2 flex flex-col items-center justify-center p-8 cursor-grab active:cursor-grabbing transition-all duration-300 select-none ${
                    isDragging ? 'shadow-2xl scale-105' : ''
                  } ${
                    swipeDirection === 'right'
                      ? 'translate-x-96 rotate-12 opacity-0'
                      : swipeDirection === 'left'
                      ? '-translate-x-96 -rotate-12 opacity-0'
                      : ''
                  }`}
                  style={{
                    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${cardRotation}deg)`,
                    borderColor: dragOffset.x > 60 ? '#10b981' : dragOffset.x < -60 ? '#ef4444' : '#e2e8f0'
                  }}
                >
                  <div className="text-4xl font-bold text-slate-900 mb-4 text-center">
                    {currentCard}
                  </div>
                  <p className="text-slate-600 text-center text-lg">
                    Is this important to you?
                  </p>
                  
                  {Math.abs(dragOffset.x) > 30 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className={`px-4 py-2 rounded-lg font-bold text-white ${
                          dragOffset.x > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ opacity: swipeProgress }}
                      >
                        {dragOffset.x > 0 ? 'YES' : 'NO'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div></div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-800">Important</h3>
                <p className="text-sm text-green-600">{yesValues.length} values</p>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {yesValues.slice(-5).map((value, index) => (
                  <div
                    key={value}
                    className="px-3 py-2 bg-green-50 text-green-800 rounded-lg text-sm text-center border border-green-200"
                  >
                    {value}
                  </div>
                ))}
                {yesValues.length > 5 && (
                  <div className="text-xs text-green-500 text-center">
                    +{yesValues.length - 5} more
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-8">
            <button
              onClick={() => handleSwipe('no')}
              disabled={isAnimating}
              className="w-16 h-16 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <X className="w-8 h-8 text-red-600" />
            </button>
            
            <button
              onClick={undoLastSelection}
              disabled={currentCardIndex === 0}
              className="w-16 h-16 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Undo className="w-8 h-8 text-slate-600" />
            </button>
            
            <button
              onClick={() => handleSwipe('yes')}
              disabled={isAnimating}
              className="w-16 h-16 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Heart className="w-8 h-8 text-green-600" />
            </button>
          </div>

          <div className="text-center text-sm text-slate-500">
            <p>👈 Drag left for No • Drag right for Yes 👉</p>
          </div>
        </div>
      )}

      {/* Step 2: Prioritization Overview */}
      {data.currentStep === 2 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Prioritize Your Values
            </h2>
            <p className="text-slate-600 mb-4">
              From your "Important" values, select the ones that truly matter most to you (maximum 20)
            </p>
            <div className="flex justify-center items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded"></div>
                <span className="text-slate-600">Available ({convertToValueObjects(yesValues).length - data.selectedValues.length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-purple-600 font-medium">Priority ({data.selectedValues.length}/20)</span>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="font-medium text-amber-900 mb-1">How to Prioritize</h3>
                <p className="text-sm text-amber-800">
                  Think about which values guide your most important decisions. Which ones would you never compromise on? 
                  These are your priorities - the values that define who you are at your core.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {convertToValueObjects(yesValues).map((value) => {
              const isSelected = data.selectedValues.some(v => v.id === value.id);
              const canSelect = isSelected || data.selectedValues.length < 20;
              
              return (
                <button
                  key={value.id}
                  onClick={() => canSelect && toggleValueSelection(value)}
                  disabled={!canSelect}
                  className={`relative p-4 rounded-lg border-2 text-center transition-all duration-200 transform hover:scale-[1.02] ${
                    isSelected
                      ? 'bg-purple-500 border-purple-600 text-white shadow-lg scale-[1.02]'
                      : canSelect
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="font-medium text-sm">{value.name}</div>
                  
                  {isSelected && (
                    <React.Fragment>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white text-purple-600 rounded-full flex items-center justify-center text-xs font-bold border border-purple-600">
                        {data.selectedValues.findIndex(v => v.id === value.id) + 1}
                      </div>
                      <Heart className="w-4 h-4 mx-auto mt-2 fill-current" />
                    </React.Fragment>
                  )}
                </button>
              );
            })}
          </div>

          {data.selectedValues.length > 0 && (
            <div className="max-w-4xl mx-auto bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-purple-900 mb-3 text-center">
                Your Priority Values ({data.selectedValues.length}/20)
              </h3>
              <div className="