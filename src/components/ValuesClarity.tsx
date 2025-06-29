import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ChevronRight, ArrowLeft, ArrowRight, Check, Heart, Filter, Search, X, Lightbulb, Users, Target, Compass, Sparkles, Shield, Globe, Wind, BookOpen, Download, RotateCcw, Save } from 'lucide-react';
import { allValues, getCategories, categoryMetadata, type Value } from '../data/values';
import { useValuesData } from '../hooks/useValuesData';

interface DraggableValueProps {
  value: Value;
  index: number;
  moveValue: (dragIndex: number, hoverIndex: number) => void;
  onRemove?: () => void;
  showRemove?: boolean;
  showRank?: boolean;
}

const DraggableValue: React.FC<DraggableValueProps> = ({ 
  value, 
  index, 
  moveValue, 
  onRemove,
  showRemove = false,
  showRank = false
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'value',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'value',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveValue(item.index, index);
        item.index = index;
      }
    },
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Achievement': 'bg-blue-50 border-blue-200 text-blue-800',
      'Connection': 'bg-pink-50 border-pink-200 text-pink-800',
      'Inner Compass': 'bg-purple-50 border-purple-200 text-purple-800',
      'Freedom & Autonomy': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'Purpose & Impact': 'bg-green-50 border-green-200 text-green-800',
      'Vitality & Health': 'bg-red-50 border-red-200 text-red-800',
      'Spiritual & Emotional': 'bg-indigo-50 border-indigo-200 text-indigo-800',
      'Creativity & Expression': 'bg-orange-50 border-orange-200 text-orange-800',
      'Learning & Growth': 'bg-emerald-50 border-emerald-200 text-emerald-800',
      'Structure & Stability': 'bg-slate-50 border-slate-200 text-slate-800'
    };
    return colors[category] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`bg-white rounded-lg p-4 shadow-sm border-2 cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md hover:scale-102'
      }`}
    >
      <div className="flex items-start justify-between">
        {showRank && (
          <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">
            {index + 1}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-slate-900">{value.name}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(value.category)}`}>
              {value.category}
            </span>
          </div>
          <p className="text-sm text-slate-600">{value.description}</p>
        </div>
        {showRemove && onRemove && (
          <button
            onClick={onRemove}
            className="ml-2 text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const ValuesClarity: React.FC = () => {
  const {
    data,
    isLoaded,
    lastSaved,
    updateCurrentStep,
    updateDiscoveryResponses,
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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showDataManagement, setShowDataManagement] = useState(false);
  const importInputRef = React.useRef<HTMLInputElement>(null);

  const steps = [
    { number: 1, title: 'Guided Discovery', description: 'Connect with your experiences and emotions' },
    { number: 2, title: 'Curated Selection', description: 'Choose 12 values that resonate with you' },
    { number: 3, title: 'Core vs Supporting', description: 'Organize into 9 core and 3 supporting values' },
    { number: 4, title: 'Rank Core Values', description: 'Prioritize your 9 core values' },
    { number: 5, title: 'Define & Envision', description: 'Make your top 6 values actionable' },
  ];

  const discoveryPrompts = [
    {
      id: 'proudMoment',
      question: 'Think of a moment you felt proud. What mattered most to you?',
      placeholder: 'Describe a time when you felt genuinely proud of yourself...',
      icon: Sparkles
    },
    {
      id: 'admiredPerson',
      question: 'Who do you admire, and why?',
      placeholder: 'Think of someone you look up to and what qualities they embody...',
      icon: Users
    }
  ];

  const themeOptions = [
    'Courage', 'Growth', 'Kindness', 'Excellence', 'Authenticity', 'Service',
    'Creativity', 'Leadership', 'Wisdom', 'Connection', 'Freedom', 'Balance'
  ];

  const getIconForCategory = (categoryName: string) => {
    const iconMap: Record<string, any> = {
      'Achievement': Target,
      'Connection': Users,
      'Inner Compass': Compass,
      'Freedom & Autonomy': Wind,
      'Purpose & Impact': Globe,
      'Vitality & Health': Heart,
      'Spiritual & Emotional': Sparkles,
      'Creativity & Expression': Lightbulb,
      'Learning & Growth': BookOpen,
      'Structure & Stability': Shield
    };
    return iconMap[categoryName] || Target;
  };

  const valueCategories = Object.entries(categoryMetadata).map(([key, meta]) => ({
    id: key.toLowerCase().replace(/\s+/g, '-'),
    name: key,
    icon: getIconForCategory(key),
    description: meta.description,
    values: allValues.filter(v => v.category === key)
  }));

  const moveValue = (dragIndex: number, hoverIndex: number) => {
    let currentValues, setCurrentValues;
    
    if (data.currentStep === 3) {
      if (data.coreValues.length > 0) {
        currentValues = data.coreValues;
        setCurrentValues = updateCoreValues;
      } else {
        currentValues = data.supportingValues;
        setCurrentValues = updateSupportingValues;
      }
    } else if (data.currentStep === 4) {
      currentValues = data.rankedCoreValues;
      setCurrentValues = updateRankedCoreValues;
    } else {
      return;
    }
    
    const draggedValue = currentValues[dragIndex];
    const newValues = [...currentValues];
    newValues.splice(dragIndex, 1);
    newValues.splice(hoverIndex, 0, draggedValue);
    setCurrentValues(newValues);
  };

  const toggleValue = (value: Value) => {
    if (data.selectedValues.find(v => v.id === value.id)) {
      updateSelectedValues(data.selectedValues.filter(v => v.id !== value.id));
    } else if (data.selectedValues.length < 12) {
      updateSelectedValues([...data.selectedValues, value]);
    }
  };

  const toggleTheme = (theme: string) => {
    const newThemes = data.discoveryResponses.themes.includes(theme) 
      ? data.discoveryResponses.themes.filter(t => t !== theme)
      : [...data.discoveryResponses.themes, theme];
    
    updateDiscoveryResponses({ themes: newThemes });
  };

  const canProceed = () => {
    switch (data.currentStep) {
      case 1:
        return data.discoveryResponses.proudMoment.trim() !== '' && 
               data.discoveryResponses.admiredPerson.trim() !== '' &&
               data.discoveryResponses.themes.length >= 3;
      case 2:
        return data.selectedValues.length === 12;
      case 3:
        return data.coreValues.length === 9 && data.supportingValues.length === 3;
      case 4:
        return data.rankedCoreValues.length === 9;
      case 5:
        return data.rankedCoreValues.slice(0, 6).every(value => 
          data.valueDefinitions[value.id]?.meaning?.trim() && 
          data.valueDefinitions[value.id]?.behavior?.trim()
        );
      default:
        return false;
    }
  };

  const proceedToNextStep = () => {
    if (data.currentStep === 2) {
      // Auto-populate core and supporting from selected values
      updateCoreValues(data.selectedValues.slice(0, 9));
      updateSupportingValues(data.selectedValues.slice(9, 12));
    } else if (data.currentStep === 3) {
      updateRankedCoreValues([...data.coreValues]);
    }
    updateCurrentStep(data.currentStep + 1);
  };

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
    }
  };

  const filteredValues = data.currentStep === 2 ? 
    allValues.filter(value => {
      const matchesSearch = value.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           value.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || value.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }) : [];

  const categories = getCategories();
  const stats = getCompletionStats();

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
            <Download className="w-4 h-4" />
            <span>Data</span>
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
              <span>Reset Journey</span>
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
                <div className="text-slate-500">Current Step</div>
                <div className="font-semibold text-slate-900">{stats.currentStep}/5</div>
              </div>
              <div>
                <div className="text-slate-500">Completion</div>
                <div className="font-semibold text-slate-900">{stats.completionPercentage}%</div>
              </div>
              <div>
                <div className="text-slate-500">Core Values</div>
                <div className="font-semibold text-slate-900">{stats.coreValuesCount}</div>
              </div>
              <div>
                <div className="text-slate-500">Defined Values</div>
                <div className="font-semibold text-slate-900">{stats.definedValuesCount}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-between max-w-4xl overflow-x-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center min-w-0">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                data.currentStep === step.number 
                  ? 'bg-purple-600 text-white' 
                  : data.currentStep > step.number
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {data.currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <div className="ml-3">
                <h3 className={`font-semibold ${
                  data.currentStep === step.number ? 'text-purple-600' : 'text-slate-700'
                }`}>
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 text-slate-400 mx-6 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div>
        {/* Step 1: Guided Discovery */}
        {data.currentStep === 1 && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
              <h2 className="text-2xl font-bold text-purple-900 mb-4">Let's Start with Your Story</h2>
              <p className="text-purple-700 mb-6">
                Before diving into values lists, let's connect with your experiences. These reflections will help guide your value selection.
              </p>
            </div>

            {discoveryPrompts.map((prompt) => {
              const Icon = prompt.icon;
              return (
                <div key={prompt.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">{prompt.question}</h3>
                      <textarea
                        value={data.discoveryResponses[prompt.id as keyof typeof data.discoveryResponses] as string}
                        onChange={(e) => updateDiscoveryResponses({ [prompt.id]: e.target.value })}
                        placeholder={prompt.placeholder}
                        className="w-full p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                What themes emerge from your reflections? (Select at least 3)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {themeOptions.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => toggleTheme(theme)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      data.discoveryResponses.themes.includes(theme)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-3">
                Selected: {data.discoveryResponses.themes.length} themes
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Curated Selection */}
        {data.currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Select 12 Values ({data.selectedValues.length}/12)
              </h2>
              <div className="text-sm text-slate-600">
                {filteredValues.length} values available
              </div>
            </div>

            {/* Category Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {valueCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.id} className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{category.name}</h3>
                        <p className="text-xs text-slate-500">{category.values.length} values</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{category.description}</p>
                    <div className="space-y-2">
                      {category.values.slice(0, 3).map((value) => {
                        const isSelected = data.selectedValues.find(v => v.id === value.id);
                        return (
                          <button
                            key={value.id}
                            onClick={() => toggleValue(value)}
                            disabled={!isSelected && data.selectedValues.length >= 12}
                            className={`w-full text-left p-2 rounded-lg text-sm transition-all ${
                              isSelected
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : data.selectedValues.length >= 12
                                ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="font-medium">{value.name}</div>
                            <div className="text-xs opacity-75">{value.description.slice(0, 50)}...</div>
                          </button>
                        );
                      })}
                      {category.values.length > 3 && (
                        <button
                          onClick={() => setSelectedCategory(category.name)}
                          className="w-full text-center p-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          View all {category.values.length} values →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Search and Filter */}
            {selectedCategory && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {selectedCategory} Values
                  </h3>
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allValues.filter(v => v.category === selectedCategory).map((value) => {
                    const isSelected = data.selectedValues.find(v => v.id === value.id);
                    return (
                      <button
                        key={value.id}
                        onClick={() => toggleValue(value)}
                        disabled={!isSelected && data.selectedValues.length >= 12}
                        className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 text-purple-900'
                            : data.selectedValues.length >= 12
                            ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{value.name}</h4>
                            <p className="text-sm opacity-75">{value.description}</p>
                          </div>
                          {isSelected && <Heart className="w-5 h-5 text-purple-500 fill-current ml-2 flex-shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Core vs Supporting */}
        {data.currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Organize Your Values
              </h2>
              <p className="text-slate-600">
                Drag your 12 selected values into Core (9) and Supporting (3) categories
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Core Values */}
              <div className="bg-purple-50 rounded-2xl p-6 border-2 border-dashed border-purple-300">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">
                  Core Values ({data.coreValues.length}/9)
                </h3>
                <p className="text-sm text-purple-700 mb-4">
                  These are your fundamental guiding principles
                </p>
                <div className="space-y-3">
                  {data.coreValues.map((value, index) => (
                    <DraggableValue
                      key={value.id}
                      value={value}
                      index={index}
                      moveValue={moveValue}
                      onRemove={() => updateCoreValues(data.coreValues.filter(v => v.id !== value.id))}
                      showRemove={true}
                    />
                  ))}
                  {data.coreValues.length === 0 && (
                    <div className="text-center py-8 text-purple-600">
                      <p>Drag values here to make them core values</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Supporting Values */}
              <div className="bg-blue-50 rounded-2xl p-6 border-2 border-dashed border-blue-300">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  Supporting Values ({data.supportingValues.length}/3)
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Important but secondary to your core values
                </p>
                <div className="space-y-3">
                  {data.supportingValues.map((value, index) => (
                    <DraggableValue
                      key={value.id}
                      value={value}
                      index={index}
                      moveValue={moveValue}
                      onRemove={() => updateSupportingValues(data.supportingValues.filter(v => v.id !== value.id))}
                      showRemove={true}
                    />
                  ))}
                  {data.supportingValues.length === 0 && (
                    <div className="text-center py-8 text-blue-600">
                      <p>Drag values here to make them supporting values</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Available Values */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.selectedValues
                  .filter(value => 
                    !data.coreValues.find(cv => cv.id === value.id) && 
                    !data.supportingValues.find(sv => sv.id === value.id)
                  )
                  .map((value) => (
                    <button
                      key={value.id}
                      onClick={() => {
                        if (data.coreValues.length < 9) {
                          updateCoreValues([...data.coreValues, value]);
                        } else if (data.supportingValues.length < 3) {
                          updateSupportingValues([...data.supportingValues, value]);
                        }
                      }}
                      disabled={data.coreValues.length >= 9 && data.supportingValues.length >= 3}
                      className="p-3 rounded-lg border border-slate-200 text-left hover:border-slate-300 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="font-medium text-slate-900">{value.name}</div>
                      <div className="text-sm text-slate-600">{value.description}</div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Rank Core Values */}
        {data.currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Rank Your Core Values
              </h2>
              <p className="text-slate-600">
                Drag to reorder by priority (most important at top)
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-4">
              {data.rankedCoreValues.map((value, index) => (
                <DraggableValue
                  key={value.id}
                  value={value}
                  index={index}
                  moveValue={moveValue}
                  showRank={true}
                />
              ))}
            </div>

            {data.rankedCoreValues.length === 9 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  🎯 Your Ranked Core Values
                </h3>
                <p className="text-green-700 mb-4">
                  These represent your priority order. Your top 6 will be used for deeper reflection in the next step.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">Top 3 Values:</h4>
                    <ol className="text-green-700 text-sm space-y-1">
                      {data.rankedCoreValues.slice(0, 3).map((value, index) => (
                        <li key={value.id}>
                          {index + 1}. <strong>{value.name}</strong>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">Next 3 Values:</h4>
                    <ol className="text-green-700 text-sm space-y-1" start={4}>
                      {data.rankedCoreValues.slice(3, 6).map((value, index) => (
                        <li key={value.id}>
                          {index + 4}. <strong>{value.name}</strong>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Define & Envision */}
        {data.currentStep === 5 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Define & Envision Your Top 6 Values
              </h2>
              <p className="text-slate-600">
                Make your values actionable by defining what they mean to you and how you live them
              </p>
            </div>

            <div className="space-y-8">
              {data.rankedCoreValues.slice(0, 6).map((value, index) => (
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
                        onChange={(e) => updateValueDefinitions(value.id, { meaning: e.target.value })}
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
                        onChange={(e) => updateValueDefinitions(value.id, { behavior: e.target.value })}
                        placeholder="Describe specific behaviors and actions that demonstrate this value..."
                        className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Completion Summary */}
            {canProceed() && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                <h3 className="text-2xl font-bold text-green-800 mb-4">
                  🎉 Your Values Journey is Complete!
                </h3>
                <p className="text-green-700 mb-6">
                  You've successfully clarified your core values and made them actionable. These insights will guide your goal setting and daily decisions.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Discovery Themes</h4>
                    <div className="flex flex-wrap gap-1">
                      {data.discoveryResponses.themes.map(theme => (
                        <span key={theme} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Core Values</h4>
                    <div className="text-sm text-green-700">
                      {data.rankedCoreValues.slice(0, 3).map((value, index) => (
                        <div key={value.id}>{index + 1}. {value.name}</div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Supporting Values</h4>
                    <div className="text-sm text-green-700">
                      {data.supportingValues.map(value => (
                        <div key={value.id}>• {value.name}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
};

export default ValuesClarity;