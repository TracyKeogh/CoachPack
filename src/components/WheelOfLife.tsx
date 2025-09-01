import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Save, TrendingUp, Info, Edit3, Download, Upload, Trash2, ArrowLeft, Mail, StickyNote } from 'lucide-react';
import PizzaSliceReflection from './wheel-of-life/PizzaSliceReflection';
import { useWheelData } from '../hooks/useWheelData';
import { useWheelSignup } from '../hooks/useWheelSignup';
import { exportWheelData, importWheelData, clearWheelData } from '../utils/storage';
import WheelSignupModal from './WheelSignupModal';
import NotesPanel from './NotesPanel';
import Header from './Header';

const WheelOfLife: React.FC = () => {
  const {
    data,
    reflectionData,
    isLoaded,
    lastSaved,
    updateScore,
    updateReflectionData,
    resetScores,
    resetAllData,
    saveData,
    getCompletionStats
  } = useWheelData();

  const { signup, hasWheelAccess, createSignup, updateWheelData } = useWheelSignup();

  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [hoveredRing, setHoveredRing] = useState<number | null>(null);
  const [selectedAreaForReflection, setSelectedAreaForReflection] = useState<number | null>(null);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const centerX = 300;
  const centerY = 300;
  const maxRadius = 180;
  const minRadius = 20;
  const segmentCount = data?.length || 0;
  const anglePerSegment = segmentCount > 0 ? (2 * Math.PI) / segmentCount : 0;

  // Update wheel data in database when data changes
  useEffect(() => {
    if (hasWheelAccess() && data && data.length > 0) {
      updateWheelData({
        lifeAreas: data,
        reflections: reflectionData,
        lastUpdated: new Date().toISOString()
      });
    }
  }, [data, reflectionData, hasWheelAccess, updateWheelData]);

  const handleSignupSuccess = (email: string) => {
    setShowSignupModal(false);
    // User now has access to the wheel
  };

  const getSegmentAndRingFromPoint = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { segmentIndex: -1, ring: -1 };

    const rect = svgRef.current.getBoundingClientRect();
    const svgX = clientX - rect.left;
    const svgY = clientY - rect.top;
    
    // Convert to SVG coordinates (accounting for viewBox scaling)
    const scaleX = 600 / rect.width;
    const scaleY = 600 / rect.height;
    
    const x = svgX * scaleX - centerX;
    const y = svgY * scaleY - centerY;
    
    // Calculate distance from center
    const distance = Math.sqrt(x * x + y * y);
    
    // Check if click is within the wheel
    if (distance < minRadius || distance > maxRadius) {
      return { segmentIndex: -1, ring: -1 };
    }
    
    // Calculate angle - start from top (negative Y axis) and go clockwise
    let angle = Math.atan2(y, x);
    // Convert to 0-2π range starting from top
    angle = (angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
    
    // Determine which segment
    const segmentIndex = anglePerSegment > 0 ? Math.floor(angle / anglePerSegment) : -1;
    
    // Determine which ring (1-10)
    const ringWidth = (maxRadius - minRadius) / 10;
    const ring = Math.min(10, Math.max(1, Math.ceil((distance - minRadius) / ringWidth)));
    
    return { segmentIndex, ring };
  };

  const handleWheelClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const { segmentIndex, ring } = getSegmentAndRingFromPoint(event.clientX, event.clientY);
    
    if (segmentIndex >= 0 && segmentIndex < (data?.length || 0) && ring >= 1 && ring <= 10) {
      updateScore(segmentIndex, ring);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const { segmentIndex, ring } = getSegmentAndRingFromPoint(event.clientX, event.clientY);
    
    if (segmentIndex >= 0 && segmentIndex < (data?.length || 0) && ring >= 1 && ring <= 10) {
      setHoveredSegment(segmentIndex);
      setHoveredRing(ring);
    } else {
      setHoveredSegment(null);
      setHoveredRing(null);
    }
  };

  const createSegmentPath = (segmentIndex: number, innerRadius: number, outerRadius: number) => {
    if (anglePerSegment === 0) return '';
    
    const startAngle = segmentIndex * anglePerSegment - Math.PI / 2; // Start from top
    const endAngle = (segmentIndex + 1) * anglePerSegment - Math.PI / 2;
    
    const x1 = centerX + innerRadius * Math.cos(startAngle);
    const y1 = centerY + innerRadius * Math.sin(startAngle);
    const x2 = centerX + outerRadius * Math.cos(startAngle);
    const y2 = centerY + outerRadius * Math.sin(startAngle);
    
    const x3 = centerX + outerRadius * Math.cos(endAngle);
    const y3 = centerY + outerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(endAngle);
    const y4 = centerY + innerRadius * Math.sin(endAngle);
    
    const largeArcFlag = anglePerSegment > Math.PI ? 1 : 0;
    
    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
      Z
    `;
  };

  const getLabelPosition = (segmentIndex: number) => {
    if (anglePerSegment === 0) return { x: centerX, y: centerY, angle: 0, textAnchor: 'middle' };
    
    const angle = (segmentIndex + 0.5) * anglePerSegment - Math.PI / 2; // Start from top
    const labelRadius = maxRadius + 50; // Increased distance for better spacing
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    
    // Determine text anchor based on position
    let textAnchor = 'middle';
    if (Math.cos(angle) > 0.3) textAnchor = 'start';
    else if (Math.cos(angle) < -0.3) textAnchor = 'end';
    
    return { x, y, angle, textAnchor };
  };

  // Function to wrap text for longer labels
  const wrapText = (text: string, maxLength: number = 8) => {
    if (!text || text.length <= maxLength) return [text || ''];
    
    const words = text.split(' ');
    if (words.length === 1) return [text]; // Single word, don't break
    
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxLength) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const handleExportData = () => {
    const dataString = exportWheelData();
    if (!dataString) return;

    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wheel-of-life-${new Date().toISOString().split('T')[0]}.json`;
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
      if (importWheelData(content)) {
        window.location.reload(); // Reload to apply imported data
      } else {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all your Wheel of Life data? This action cannot be undone.')) {
      clearWheelData();
      resetAllData();
    }
  };

  const stats = getCompletionStats();
  const averageScore = stats.averageScore;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Thriving';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Needs Attention';
    return 'Priority Area';
  };

  // If reflection mode is active, show pizza slice reflection interface
  if (selectedAreaForReflection !== null && data && data[selectedAreaForReflection]) {
    const selectedArea = data[selectedAreaForReflection];
    const reflection = reflectionData[selectedAreaForReflection] || { 
      goingWell: [], 
      needsImprovement: [], 
      idealVision: '', 
      targetRating: 8 
    };

    return (
      <PizzaSliceReflection
        selectedArea={selectedArea}
        areaIndex={selectedAreaForReflection}
        reflection={reflection}
        onBack={() => setSelectedAreaForReflection(null)}
        onUpdateReflection={updateReflectionData}
        onUpdateScore={updateScore}
      />
    );
  }

  // Early return if not loaded yet
  if (!isLoaded) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Your Wheel of Life...</h2>
            <p className="text-slate-600">Retrieving your saved progress...</p>
          </div>
        </div>
      </div>
    );
  }

  // Early return if no data to prevent rendering issues
  if (!data || data.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Wheel Data Available</h2>
            <p className="text-slate-600">Please refresh the page to load the default wheel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="ml-16">
        <div className="space-y-8">
          {/* Header with signup info */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Wheel of Life Assessment</h1>
              <p className="text-slate-600 mt-2">
                Click anywhere in the rings to rate each life area from 1-10. Inner rings = lower scores, outer rings = higher scores.
              </p>
              {signup && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <p className="text-sm text-green-600">
                    Signed up as {signup.email} • Your progress is automatically saved
                  </p>
                </div>
              )}
              {lastSaved && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <StickyNote className="w-4 h-4" />
                <span>Notes</span>
              </button>
              <button
                onClick={() => setShowDataManagement(!showDataManagement)}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Data</span>
              </button>
              <button
                onClick={resetScores}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
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
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Data</span>
                </button>
                
                <button
                  onClick={handleClearAllData}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Data</span>
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Your Progress</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500">Completion</div>
                    <div className="font-semibold text-slate-900">
                      {Math.round((stats.completedReflections / stats.totalAreas) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Reflections</div>
                    <div className="font-semibold text-slate-900">
                      {stats.completedReflections}/{stats.totalAreas}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Average Score</div>
                    <div className="font-semibold text-slate-900">
                      {averageScore.toFixed(1)}/10
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Areas Needing Attention</div>
                    <div className="font-semibold text-slate-900">
                      {stats.areasNeedingAttention}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Interactive Wheel */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <div className="flex flex-col items-center">
                  <svg
                    ref={svgRef}
                    width="600"
                    height="600"
                    viewBox="0 0 600 600"
                    className="cursor-pointer"
                    onClick={handleWheelClick}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => {
                      setHoveredSegment(null);
                      setHoveredRing(null);
                    }}
                  >
                    {/* Background rings */}
                    {Array.from({ length: 10 }, (_, ringIndex) => {
                      const ring = ringIndex + 1;
                      const innerRadius = minRadius + (ringIndex * (maxRadius - minRadius)) / 10;
                      const outerRadius = minRadius + ((ringIndex + 1) * (maxRadius - minRadius)) / 10;
                      
                      return (
                        <g key={`ring-${ring}`}>
                          {(data || []).filter(Boolean).map((segment, segmentIndex) => {
                            const isHovered = hoveredSegment === segmentIndex && hoveredRing === ring;
                            const isScored = segment.score >= ring;
                            const path = createSegmentPath(segmentIndex, innerRadius, outerRadius);
                            
                            let fillColor = '#f8fafc'; // Default light gray
                            let strokeColor = '#e2e8f0';
                            let opacity = 0.3;
                            
                            if (isScored) {
                              fillColor = segment.color;
                              opacity = 0.4 + (ring / 10) * 0.5; // Gradient effect from inner to outer
                            }
                            
                            if (isHovered) {
                              opacity = Math.max(opacity, 0.9);
                              strokeColor = segment.darkColor;
                            }
                            
                            return (
                              <path
                                key={`segment-${segmentIndex}-ring-${ring}`}
                                d={path}
                                fill={fillColor}
                                fillOpacity={opacity}
                                stroke={strokeColor}
                                strokeWidth={isHovered ? 3 : 1}
                                className="transition-all duration-150"
                              />
                            );
                          })}
                        </g>
                      );
                    })}

                    {/* Center circle */}
                    <circle
                      cx={centerX}
                      cy={centerY}
                      r={minRadius}
                      fill="white"
                      stroke="#e2e8f0"
                      strokeWidth="2"
                    />

                    {/* Score rings indicators */}
                    {Array.from({ length: 10 }, (_, i) => {
                      const ring = i + 1;
                      const radius = minRadius + (ring * (maxRadius - minRadius)) / 10;
                      return (
                        <circle
                          key={`indicator-${ring}`}
                          cx={centerX}
                          cy={centerY}
                          r={radius}
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="1"
                          opacity="0.3"
                        />
                      );
                    })}

                    {/* Ring numbers */}
                    {Array.from({ length: 10 }, (_, i) => {
                      const ring = i + 1;
                      const radius = minRadius + ((i + 0.5) * (maxRadius - minRadius)) / 10;
                      const x = centerX;
                      const y = centerY - radius;
                      
                      return (
                        <text
                          key={`ring-number-${ring}`}
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs fill-slate-400 pointer-events-none"
                          fontSize="10"
                        >
                          {ring}
                        </text>
                      );
                    })}

                    {/* Labels with text wrapping */}
                    {(data || []).filter(Boolean).map((segment, index) => {
                      const { x, y, textAnchor } = getLabelPosition(index);
                      const wrappedText = wrapText(segment.area);
                      const lineHeight = 14;
                      const totalHeight = wrappedText.length * lineHeight;
                      const startY = y - totalHeight / 2 - 5;
                      
                      return (
                        <g key={`label-${index}`}>
                          {/* Area name with text wrapping and shadow for better readability */}
                          {wrappedText.map((line, lineIndex) => (
                            <g key={`line-${lineIndex}`}>
                              {/* White shadow */}
                              <text
                                x={x}
                                y={startY + (lineIndex * lineHeight)}
                                textAnchor={textAnchor}
                                dominantBaseline="middle"
                                className="text-sm font-bold pointer-events-none"
                                fill="white"
                                stroke="white"
                                strokeWidth="3"
                              >
                                {line}
                              </text>
                              {/* Colored text */}
                              <text
                                x={x}
                                y={startY + (lineIndex * lineHeight)}
                                textAnchor={textAnchor}
                                dominantBaseline="middle"
                                className="text-sm font-bold pointer-events-none"
                                fill={segment.darkColor}
                              >
                                {line}
                              </text>
                            </g>
                          ))}
                          
                          {/* Score with text shadow */}
                          <text
                            x={x}
                            y={y + totalHeight / 2 + 8}
                            textAnchor={textAnchor}
                            dominantBaseline="middle"
                            className="text-xs font-semibold pointer-events-none"
                            fill="white"
                            stroke="white"
                            strokeWidth="2"
                          >
                            Score: {segment.score}
                          </text>
                          <text
                            x={x}
                            y={y + totalHeight / 2 + 8}
                            textAnchor={textAnchor}
                            dominantBaseline="middle"
                            className="text-xs font-semibold pointer-events-none"
                            fill={segment.color}
                          >
                            Score: {segment.score}
                          </text>
                        </g>
                      );
                    })}

                    {/* Center score */}
                    <circle
                      cx={centerX}
                      cy={centerY}
                      r={15}
                      fill="white"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                    />
                    <text
                      x={centerX}
                      y={centerY - 3}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-sm font-bold fill-slate-900 pointer-events-none"
                    >
                      {averageScore.toFixed(1)}
                    </text>
                    <text
                      x={centerX}
                      y={centerY + 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs fill-slate-600 pointer-events-none"
                    >
                      Avg
                    </text>
                  </svg>

                  {/* Hover tooltip */}
                  {hoveredSegment !== null && hoveredRing !== null && data && data[hoveredSegment] && (
                    <div className="mt-4 p-3 bg-slate-900 text-white rounded-lg text-sm font-medium">
                      Click to set <strong>{data[hoveredSegment]?.area}</strong> to score <strong>{hoveredRing}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Overall Balance</h3>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  {averageScore.toFixed(1)}/10
                </div>
                <p className="text-purple-100 text-sm">
                  {averageScore >= 8 ? 'Excellent balance!' :
                   averageScore >= 6 ? 'Good overall balance' :
                   'Room for improvement'}
                </p>
                <div className="mt-3 text-xs text-purple-200">
                  {stats.completedReflections}/{stats.totalAreas} reflections completed
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">How to Use</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Click anywhere in the rings to set your score</li>
                      <li>• Inner rings = lower scores (1-3)</li>
                      <li>• Middle rings = moderate scores (4-7)</li>
                      <li>• Outer rings = high scores (8-10)</li>
                      <li>• Click "Reflect" to dive deeper into any area</li>
                      <li>• All changes are automatically saved</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Reflection Access */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Reflect on Areas</h3>
                <div className="space-y-3">
                  {(data || []).filter(Boolean).map((item, index) => {
                    const hasReflection = reflectionData[index] && (
                      reflectionData[index].goingWell.length > 0 ||
                      reflectionData[index].needsImprovement.length > 0 ||
                      reflectionData[index].idealVision.trim() !== ''
                    );
                    
                    return (
                      <button
                        key={item.area}
                        onClick={() => setSelectedAreaForReflection(index)}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <div>
                            <div className="font-medium text-slate-900 flex items-center space-x-2">
                              <span>{item.area}</span>
                              {hasReflection && (
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                              )}
                            </div>
                            <div className="text-sm text-slate-500">Score: {item.score}/10</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(item.score)}`}>
                            {getScoreLabel(item.score)}
                          </span>
                          <Edit3 className="w-4 h-4 text-slate-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Insights */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Insights</h3>
                <div className="space-y-3 text-sm">
                  {(data || [])
                    .filter(item => item && item.score <= 5)
                    .slice(0, 3)
                    .map((item) => (
                      <div key={item.area} className="flex items-start space-x-2">
                        <div 
                          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <p className="text-slate-600">
                          <span className="font-medium text-slate-900">{item.area}</span> could use more attention
                        </p>
                      </div>
                    ))}
                  {(data || []).filter(item => item && item.score <= 5).length === 0 && (
                    <p className="text-green-600 font-medium">All areas are performing well! 🎉</p>
                  )}
                </div>
              </div>

              {/* Notes Panel */}
              {showNotes && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <NotesPanel feature="wheel" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WheelOfLife;