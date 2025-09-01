import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Heart, X, ArrowLeft, ArrowRight, RotateCcw, Check, Move, 
  Undo, ChevronUp, ChevronDown, Download, Save, Upload 
} from 'lucide-react';
import { allValues, type Value } from '../data/values';
import { useValuesData } from '../hooks/useValuesData';
import Header from './Header';
import Navigation from './Navigation';

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
    exportData,
    importData,
    clearAllData
  } = useValuesData();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [yesValues, setYesValues] = useState<string[]>([]);
  const [noValues, setNoValues] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showDataManagement, setShowDataManagement] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [shuffledValues] = useState(() => 
    allValues.map(v => v.name).sort(() => Math.random() - 0.5)
  );

  const convertToValueObjects = (valueNames: string[]): Value[] => {
    return valueNames.map(name => allValues.find(v => v.name === name)!).filter(Boolean);
  };

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
        const yesValueObjects = convertToValueObjects([...yesValues, currentValue]);
        updateSelectedValues(yesValueObjects);
        updateCurrentStep(2);
      }
      setIsAnimating(false);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 300);
  }, [isAnimating, currentCardIndex, shuffledValues, yesValues, updateSelectedValues, updateCurrentStep]);

  const undoLastSelection = () => {
    if (currentCardIndex > 0) {
      const lastValue = shuffledValues[currentCardIndex - 1];
      setYesValues(prev => prev.filter(v => v !== lastValue));
      setNoValues(prev => prev.filter(v => v !== lastValue));
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  const toggleValueSelection = (value: Value) => {
    if (data.selectedValues.some(v => v.id === value.id)) {
      updateSelectedValues(data.selectedValues.filter(v => v.id !== value.id));
    } else if (data.selectedValues.length < 20) {
      updateSelectedValues([...data.selectedValues, value]);
    }
  };

  const proceedToNextStep = () => {
    if (data.currentStep === 2) {
      updateCoreValues(data.selectedValues.slice(0, Math.min(9, data.selectedValues.length)));
      updateSupportingValues(data.selectedValues.slice(9, Math.min(12, data.selectedValues.length)));
      updateCurrentStep(3);
    } else if (data.currentStep === 3) {
      if (data.coreValues.length > 0) {
        updateRankedCoreValues([...data.coreValues]);
      }
      updateCurrentStep(4);
    } else {
      updateCurrentStep(data.currentStep + 1);
    }
  };

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
      default:
        return false;
    }
  };

  const currentCard = shuffledValues[currentCardIndex];
  const progress = data.currentStep === 1 ? ((currentCardIndex + 1) / shuffledValues.length) * 100 : 100;
  const swipeProgress = Math.min(Math.abs(dragOffset.x) / 120, 1);
  const cardRotation = dragOffset.x * 0.1;

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
    <>
      <Header />
      <Navigation 
        currentView="values" 
        onNavigate={(view) => window.location.href = `/${view}`}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-80'} p-6`}>
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Values Clarification</h1>
          <p className="text-slate-600 mt-2">
            Discover your core values through guided reflection and structured exploration
          </p>
        </div>
      </div>

      <div className="text-center">
        <div className="flex justify-center space-x-4 mb-6">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= data.currentStep
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step < data.currentStep ? <Check className="w-5 h-5" /> : step}
            </div>
          ))}
        </div>
      </div>

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
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-red-800">Not Important</h3>
                <p className="text-sm text-red-600">{noValues.length} values</p>
              </div>
            </div>

            <div></div>

            <div className="relative h-96 flex items-center justify-center">
              {currentCardIndex < shuffledValues.length && (
                <div
                  onMouseDown={handleMouseDown}
                  className="w-80 h-80 bg-white rounded-2xl shadow-lg border-2 flex flex-col items-center justify-center p-8 cursor-grab active:cursor-grabbing transition-all duration-300 select-none"
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
            <p>Drag left for No • Drag right for Yes</p>
          </div>
        </div>
      )}

      {data.currentStep === 2 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Prioritize Your Values
            </h2>
            <p className="text-slate-600 mb-4">
              Select your most important values (maximum 20)
            </p>
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
                  className={`relative p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-purple-500 border-purple-600 text-white shadow-lg'
                      : canSelect
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="font-medium text-sm">{value.name}</div>
                  {isSelected && (
                    <Heart className="w-4 h-4 mx-auto mt-2 fill-current" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={proceedToNextStep}
              disabled={data.selectedValues.length === 0}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          </div>
        </div>
      )}

      {data.currentStep >= 3 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Values Process Complete!</h2>
          <p className="text-slate-600">Your values have been saved and are available throughout the app.</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={() => updateCurrentStep(Math.max(1, data.currentStep - 1))}
          disabled={data.currentStep === 1}
          className="flex items-center space-x-2 px-6 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-sm text-slate-500">
          Step {data.currentStep} of 5
        </div>

        <button
          onClick={proceedToNextStep}
          disabled={!canProceed()}
          className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
      </div>
    </>
  );
};

export default ValuesClarity;