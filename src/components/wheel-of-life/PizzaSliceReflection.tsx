import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Save, Check } from 'lucide-react';

interface LifeArea {
  area: string;
  score: number;
  color: string;
  lightColor: string;
  darkColor: string;
}

interface ReflectionData {
  goingWell: string[];
  needsImprovement: string[];
  idealVision: string;
  targetRating: number;
}

interface PizzaSliceReflectionProps {
  selectedArea: LifeArea;
  areaIndex: number;
  reflection: ReflectionData;
  onBack: () => void;
  onUpdateReflection: (areaIndex: number, field: keyof ReflectionData, value: any) => void;
  onUpdateScore: (areaIndex: number, newScore: number) => void;
}

const PizzaSliceReflection: React.FC<PizzaSliceReflectionProps> = ({
  selectedArea,
  areaIndex,
  reflection,
  onBack,
  onUpdateReflection,
  onUpdateScore
}) => {
  const [hoveredRing, setHoveredRing] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const centerX = 200;
  const centerY = 150;
  const maxRadius = 120;
  const minRadius = 20;
  
  // Target slice - 45 degrees (1/8 of circle) - top right
  const targetStartAngle = -Math.PI / 8; // -22.5 degrees
  const targetEndAngle = Math.PI / 8;    // +22.5 degrees

  // Current slice - 45 degrees (1/8 of circle) - bottom left (opposite)
  const currentStartAngle = Math.PI - Math.PI / 8; // 157.5 degrees
  const currentEndAngle = Math.PI + Math.PI / 8;   // 202.5 degrees

  // Auto-save effect
  useEffect(() => {
    setSaveStatus('saving');
    const timeoutId = setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [reflection]);

  const createSlicePath = (innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
    const x1 = centerX + innerRadius * Math.cos(startAngle);
    const y1 = centerY + innerRadius * Math.sin(startAngle);
    const x2 = centerX + outerRadius * Math.cos(startAngle);
    const y2 = centerY + outerRadius * Math.sin(startAngle);
    
    const x3 = centerX + outerRadius * Math.cos(endAngle);
    const y3 = centerY + outerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(endAngle);
    const y4 = centerY + innerRadius * Math.sin(endAngle);
    
    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}
      Z
    `;
  };

  const handleRingClick = (ring: number) => {
    onUpdateReflection(areaIndex, 'targetRating', ring);
  };

  const getPointFromRing = (clientX: number, clientY: number, svgElement: SVGSVGElement) => {
    const rect = svgElement.getBoundingClientRect();
    const svgX = clientX - rect.left;
    const svgY = clientY - rect.top;
    
    const scaleX = 400 / rect.width;
    const scaleY = 300 / rect.height;
    
    const x = svgX * scaleX - centerX;
    const y = svgY * scaleY - centerY;
    
    const distance = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);
    
    // Check if within target slice angle
    if (angle >= targetStartAngle && angle <= targetEndAngle) {
      // Check if within radius bounds
      if (distance >= minRadius && distance <= maxRadius) {
        // Calculate ring
        const ringWidth = (maxRadius - minRadius) / 10;
        const ring = Math.min(10, Math.max(1, Math.ceil((distance - minRadius) / ringWidth)));
        return ring;
      }
    }
    
    return null;
  };

  const addGoingWellItem = () => {
    onUpdateReflection(areaIndex, 'goingWell', [...reflection.goingWell, '']);
  };

  const addNeedsImprovementItem = () => {
    onUpdateReflection(areaIndex, 'needsImprovement', [...reflection.needsImprovement, '']);
  };

  const updateListItem = (listType: 'goingWell' | 'needsImprovement', index: number, value: string) => {
    const newList = [...reflection[listType]];
    newList[index] = value;
    onUpdateReflection(areaIndex, listType, newList);
  };

  const removeListItem = (listType: 'goingWell' | 'needsImprovement', index: number) => {
    const newList = reflection[listType].filter((_, i) => i !== index);
    onUpdateReflection(areaIndex, listType, newList);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Wheel</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {selectedArea.area} Reflection
            </h1>
            <p className="text-slate-600 mt-2">
              Set your target and reflect on this life area
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {saveStatus === 'saving' && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Auto-saving...</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center space-x-2 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm">Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* Centered Content */}
      <div className="max-w-xl mx-auto space-y-8">
        {/* Pizza Slice Target & Current Selector */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col items-center">
            <svg
              width="400"
              height="300"
              viewBox="0 0 400 300"
              className="cursor-pointer"
              onClick={(e) => {
                const ring = getPointFromRing(e.clientX, e.clientY, e.currentTarget);
                if (ring) handleRingClick(ring);
              }}
              onMouseMove={(e) => {
                const ring = getPointFromRing(e.clientX, e.clientY, e.currentTarget);
                setHoveredRing(ring);
              }}
              onMouseLeave={() => setHoveredRing(null)}
            >
              {/* Target slice rings */}
              {Array.from({ length: 10 }, (_, ringIndex) => {
                const ring = ringIndex + 1;
                const innerRadius = minRadius + (ringIndex * (maxRadius - minRadius)) / 10;
                const outerRadius = minRadius + ((ringIndex + 1) * (maxRadius - minRadius)) / 10;
                
                const isHovered = hoveredRing === ring;
                const isTarget = reflection.targetRating === ring;
                
                let fillColor = '#f8fafc';
                let fillOpacity = 0.3;
                let strokeColor = '#e2e8f0';
                let strokeWidth = 1;
                
                if (isTarget) {
                  fillColor = selectedArea.color;
                  fillOpacity = 0.8;
                  strokeColor = selectedArea.darkColor;
                  strokeWidth = 2;
                } else if (isHovered) {
                  fillColor = selectedArea.color;
                  fillOpacity = 0.2;
                  strokeColor = selectedArea.color;
                }
                
                return (
                  <path
                    key={`target-ring-${ring}`}
                    d={createSlicePath(innerRadius, outerRadius, targetStartAngle, targetEndAngle)}
                    fill={fillColor}
                    fillOpacity={fillOpacity}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className="transition-all duration-150"
                  />
                );
              })}

              {/* Current slice rings (read-only) */}
              {Array.from({ length: 10 }, (_, ringIndex) => {
                const ring = ringIndex + 1;
                const innerRadius = minRadius + (ringIndex * (maxRadius - minRadius)) / 10;
                const outerRadius = minRadius + ((ringIndex + 1) * (maxRadius - minRadius)) / 10;
                
                const isCurrent = selectedArea.score === ring;
                
                let fillColor = '#f8fafc';
                let fillOpacity = 0.2;
                let strokeColor = '#e2e8f0';
                let strokeWidth = 1;
                
                if (isCurrent) {
                  fillColor = selectedArea.color;
                  fillOpacity = 0.6;
                  strokeColor = selectedArea.darkColor;
                  strokeWidth = 2;
                }
                
                return (
                  <path
                    key={`current-ring-${ring}`}
                    d={createSlicePath(innerRadius, outerRadius, currentStartAngle, currentEndAngle)}
                    fill={fillColor}
                    fillOpacity={fillOpacity}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className="transition-all duration-150"
                  />
                );
              })}

              {/* Target slice ring borders */}
              {Array.from({ length: 11 }, (_, i) => {
                const radius = minRadius + (i * (maxRadius - minRadius)) / 10;
                const x1 = centerX + radius * Math.cos(targetStartAngle);
                const y1 = centerY + radius * Math.sin(targetStartAngle);
                const x2 = centerX + radius * Math.cos(targetEndAngle);
                const y2 = centerY + radius * Math.sin(targetEndAngle);
                
                return (
                  <path
                    key={`target-border-${i}`}
                    d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                );
              })}

              {/* Current slice ring borders */}
              {Array.from({ length: 11 }, (_, i) => {
                const radius = minRadius + (i * (maxRadius - minRadius)) / 10;
                const x1 = centerX + radius * Math.cos(currentStartAngle);
                const y1 = centerY + radius * Math.sin(currentStartAngle);
                const x2 = centerX + radius * Math.cos(currentEndAngle);
                const y2 = centerY + radius * Math.sin(currentEndAngle);
                
                return (
                  <path
                    key={`current-border-${i}`}
                    d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                );
              })}

              {/* Target slice side borders */}
              <line
                x1={centerX + minRadius * Math.cos(targetStartAngle)}
                y1={centerY + minRadius * Math.sin(targetStartAngle)}
                x2={centerX + maxRadius * Math.cos(targetStartAngle)}
                y2={centerY + maxRadius * Math.sin(targetStartAngle)}
                stroke="#e2e8f0"
                strokeWidth="1"
                opacity="0.5"
              />
              <line
                x1={centerX + minRadius * Math.cos(targetEndAngle)}
                y1={centerY + minRadius * Math.sin(targetEndAngle)}
                x2={centerX + maxRadius * Math.cos(targetEndAngle)}
                y2={centerY + maxRadius * Math.sin(targetEndAngle)}
                stroke="#e2e8f0"
                strokeWidth="1"
                opacity="0.5"
              />

              {/* Current slice side borders */}
              <line
                x1={centerX + minRadius * Math.cos(currentStartAngle)}
                y1={centerY + minRadius * Math.sin(currentStartAngle)}
                x2={centerX + maxRadius * Math.cos(currentStartAngle)}
                y2={centerY + maxRadius * Math.sin(currentStartAngle)}
                stroke="#e2e8f0"
                strokeWidth="1"
                opacity="0.5"
              />
              <line
                x1={centerX + minRadius * Math.cos(currentEndAngle)}
                y1={centerY + minRadius * Math.sin(currentEndAngle)}
                x2={centerX + maxRadius * Math.cos(currentEndAngle)}
                y2={centerY + maxRadius * Math.sin(currentEndAngle)}
                stroke="#e2e8f0"
                strokeWidth="1"
                opacity="0.5"
              />

              {/* Labels */}
              <text
                x={centerX + (maxRadius + 40) * Math.cos((targetStartAngle + targetEndAngle) / 2)}
                y={centerY + (maxRadius + 40) * Math.sin((targetStartAngle + targetEndAngle) / 2)}
                textAnchor="middle"
                className="text-sm font-semibold fill-slate-700"
              >
                Set Target Score
              </text>
              
              <text
                x={centerX + (maxRadius + 40) * Math.cos((currentStartAngle + currentEndAngle) / 2)}
                y={centerY + (maxRadius + 40) * Math.sin((currentStartAngle + currentEndAngle) / 2)}
                textAnchor="middle"
                className="text-sm font-semibold fill-slate-700"
              >
                Current
              </text>

              {/* Area label */}
              <text
                x={centerX}
                y={centerY + maxRadius + 50}
                textAnchor="middle"
                className="text-lg font-semibold fill-slate-900"
              >
                {selectedArea.area}
              </text>
            </svg>

            {/* Score indicators */}
            <div className="flex items-center justify-center space-x-8 mt-4">
              <div className="text-center">
                <div className="text-sm text-slate-500 mb-1">Current</div>
                <div 
                  className="text-2xl font-bold px-3 py-1 rounded-lg"
                  style={{ color: selectedArea.color, backgroundColor: selectedArea.lightColor }}
                >
                  {selectedArea.score}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-500 mb-1">Target</div>
                <div 
                  className="text-2xl font-bold px-3 py-1 rounded-lg"
                  style={{ color: selectedArea.color, backgroundColor: selectedArea.lightColor }}
                >
                  {reflection.targetRating}
                </div>
              </div>
            </div>

            {/* Hover tooltip */}
            {hoveredRing && (
              <div className="mt-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-sm">
                Click to set target = {hoveredRing}
              </div>
            )}
          </div>
        </div>

        {/* What's Going Well */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">What's Going Well?</h3>
            <button
              onClick={addGoingWellItem}
              className="flex items-center space-x-1 px-3 py-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          <div className="space-y-3">
            {reflection.goingWell.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <p className="mb-3">What aspects of your {selectedArea.area.toLowerCase()} are working well?</p>
                <button
                  onClick={addGoingWellItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Add your first item
                </button>
              </div>
            ) : (
              reflection.goingWell.map((item, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0" />
                  <div className="flex-1">
                    <textarea
                      value={item}
                      onChange={(e) => updateListItem('goingWell', index, e.target.value)}
                      placeholder="What's working well in this area?"
                      className="w-full p-2 border border-green-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                      rows={2}
                    />
                  </div>
                  <button
                    onClick={() => removeListItem('goingWell', index)}
                    className="text-slate-400 hover:text-red-500 mt-2 p-1 hover:bg-white rounded transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* What Needs Improvement */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">What Needs Improvement?</h3>
            <button
              onClick={addNeedsImprovementItem}
              className="flex items-center space-x-1 px-3 py-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          <div className="space-y-3">
            {reflection.needsImprovement.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-orange-600" />
                </div>
                <p className="mb-3">What aspects could be better in your {selectedArea.area.toLowerCase()}?</p>
                <button
                  onClick={addNeedsImprovementItem}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Add your first item
                </button>
              </div>
            ) : (
              reflection.needsImprovement.map((item, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-3 flex-shrink-0" />
                  <div className="flex-1">
                    <textarea
                      value={item}
                      onChange={(e) => updateListItem('needsImprovement', index, e.target.value)}
                      placeholder="What could be improved in this area?"
                      className="w-full p-2 border border-orange-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      rows={2}
                    />
                  </div>
                  <button
                    onClick={() => removeListItem('needsImprovement', index)}
                    className="text-slate-400 hover:text-red-500 mt-2 p-1 hover:bg-white rounded transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ideal Vision */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Describe Your Ideal Vision</h3>
          <textarea
            value={reflection.idealVision}
            onChange={(e) => onUpdateReflection(areaIndex, 'idealVision', e.target.value)}
            placeholder="Describe what this life area looks and feels like at its best. Be specific and vivid in your description."
            className="w-full p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {/* Completion Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Reflection Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-purple-800 mb-2">Strengths</h4>
              <p className="text-purple-700">
                {reflection.goingWell.length} positive aspects identified
              </p>
            </div>
            <div>
              <h4 className="font-medium text-purple-800 mb-2">Growth Areas</h4>
              <p className="text-purple-700">
                {reflection.needsImprovement.length} improvement opportunities
              </p>
            </div>
            <div>
              <h4 className="font-medium text-purple-800 mb-2">Growth Potential</h4>
              <p className="text-purple-700">
                {reflection.targetRating > selectedArea.score 
                  ? `${reflection.targetRating - selectedArea.score} point improvement target`
                  : reflection.targetRating === selectedArea.score
                  ? 'Maintaining current level'
                  : 'Reassessing expectations'
                }
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-purple-800 text-sm">
              <strong>💡 Remember:</strong> All your reflections are automatically saved and will be available throughout your coaching journey. Use these insights to guide your goal setting and action planning in the next steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaSliceReflection;