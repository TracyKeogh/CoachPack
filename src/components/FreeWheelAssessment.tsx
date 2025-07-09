import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Save, TrendingUp, Info, Mail, CheckCircle2, Star, RotateCcw, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import { useWheelSignup } from '../hooks/useWheelSignup';
import { Link } from 'react-router-dom';

interface LifeArea {
  area: string;
  score: number;
  satisfaction: 'satisfied' | 'want-higher' | 'want-lower' | null;
  color: string;
  lightColor: string;
  darkColor: string;
}

interface FreeWheelAssessmentProps {
  onComplete: (results: any) => void;
  onBackToLanding: () => void;
}

const initialData: LifeArea[] = [
  { area: 'Career', score: 0, satisfaction: null, color: '#8B5CF6', lightColor: '#EDE9FE', darkColor: '#7C3AED' },
  { area: 'Finances', score: 0, satisfaction: null, color: '#10B981', lightColor: '#D1FAE5', darkColor: '#059669' },
  { area: 'Health', score: 0, satisfaction: null, color: '#F59E0B', lightColor: '#FEF3C7', darkColor: '#D97706' },
  { area: 'Family', score: 0, satisfaction: null, color: '#EF4444', lightColor: '#FEE2E2', darkColor: '#DC2626' },
  { area: 'Romance', score: 0, satisfaction: null, color: '#EC4899', lightColor: '#FCE7F3', darkColor: '#DB2777' },
  { area: 'Personal Growth', score: 0, satisfaction: null, color: '#06B6D4', lightColor: '#CFFAFE', darkColor: '#0891B2' },
  { area: 'Fun & Recreation', score: 0, satisfaction: null, color: '#84CC16', lightColor: '#ECFCCB', darkColor: '#65A30D' },
  { area: 'Environment', score: 0, satisfaction: null, color: '#F97316', lightColor: '#FED7AA', darkColor: '#EA580C' },
];

const FreeWheelAssessment: React.FC<FreeWheelAssessmentProps> = ({ onComplete, onBackToLanding }) => {
  const { signup, updateWheelData } = useWheelSignup();
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [data, setData] = useState<LifeArea[]>(initialData);
  const [currentStep, setCurrentStep] = useState<'rating' | 'satisfaction'>('rating');
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [hoveredRing, setHoveredRing] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const currentArea = data[currentAreaIndex];
  const progress = currentStep === 'rating' 
    ? ((currentAreaIndex + 1) / data.length) * 50 // First 50% for rating
    : 50 + ((currentAreaIndex + 1) / data.length) * 50; // Next 50% for satisfaction
  
  const allAreasRated = data.every(area => area.score > 0);
  const allSatisfactionSet = data.every(area => area.satisfaction !== null);

  // Wheel configuration
  const centerX = 300;
  const centerY = 300;
  const maxRadius = 180;
  const minRadius = 20;
  const segmentCount = data.length;
  const anglePerSegment = (2 * Math.PI) / segmentCount;

  const getSegmentAndRingFromPoint = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { segmentIndex: -1, ring: -1 };

    const rect = svgRef.current.getBoundingClientRect();
    const svgX = clientX - rect.left;
    const svgY = clientY - rect.top;
    
    const scaleX = 600 / rect.width;
    const scaleY = 600 / rect.height;
    
    const x = svgX * scaleX - centerX;
    const y = svgY * scaleY - centerY;
    
    const distance = Math.sqrt(x * x + y * y);
    
    if (distance < minRadius || distance > maxRadius) {
      return { segmentIndex: -1, ring: -1 };
    }
    
    let angle = Math.atan2(y, x);
    angle = (angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
    
    const segmentIndex = Math.floor(angle / anglePerSegment);
    const ringWidth = (maxRadius - minRadius) / 10;
    const ring = Math.min(10, Math.max(1, Math.ceil((distance - minRadius) / ringWidth)));
    
    return { segmentIndex, ring };
  };

  const handleWheelClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (currentStep !== 'rating') return;
    
    const { segmentIndex, ring } = getSegmentAndRingFromPoint(event.clientX, event.clientY);
    
    if (segmentIndex >= 0 && segmentIndex < data.length && ring >= 1 && ring <= 10) {
      updateScore(segmentIndex, ring);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (currentStep !== 'rating') return;
    
    const { segmentIndex, ring } = getSegmentAndRingFromPoint(event.clientX, event.clientY);
    
    if (segmentIndex >= 0 && segmentIndex < data.length && ring >= 1 && ring <= 10) {
      setHoveredSegment(segmentIndex);
      setHoveredRing(ring);
    } else {
      setHoveredSegment(null);
      setHoveredRing(null);
    }
  };

  const createSegmentPath = (segmentIndex: number, innerRadius: number, outerRadius: number) => {
    const startAngle = segmentIndex * anglePerSegment - Math.PI / 2;
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
    const angle = (segmentIndex + 0.5) * anglePerSegment - Math.PI / 2;
    const labelRadius = maxRadius + 50;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    
    let textAnchor = 'middle';
    if (Math.cos(angle) > 0.3) textAnchor = 'start';
    else if (Math.cos(angle) < -0.3) textAnchor = 'end';
    
    return { x, y, angle, textAnchor };
  };

  const wrapText = (text: string, maxLength: number = 8) => {
    if (!text || text.length <= maxLength) return [text || ''];
    
    const words = text.split(' ');
    if (words.length === 1) return [text];
    
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

  const updateScore = (segmentIndex: number, newScore: number) => {
    setData(prev => 
      prev.map((item, index) => 
        index === segmentIndex 
          ? { ...item, score: Math.max(1, Math.min(10, newScore)), satisfaction: null }
          : item
      )
    );
  };

  const updateSatisfaction = (satisfaction: 'satisfied' | 'want-higher' | 'want-lower') => {
    setData(prev => 
      prev.map((item, index) => 
        index === currentAreaIndex 
          ? { ...item, satisfaction }
          : item
      )
    );
  };

  const goToNext = () => {
    if (currentStep === 'rating') {
      if (currentArea.score === 0) return; // Can't proceed without rating
      
      if (currentAreaIndex < data.length - 1) {
        setCurrentAreaIndex(prev => prev + 1);
      } else if (allAreasRated) {
        // Move to satisfaction step
        setCurrentStep('satisfaction');
        setCurrentAreaIndex(0);
      }
    } else if (currentStep === 'satisfaction') {
      if (currentArea.satisfaction === null) return; // Can't proceed without satisfaction
      
      if (currentAreaIndex < data.length - 1) {
        setCurrentAreaIndex(prev => prev + 1);
      } else if (allSatisfactionSet) {
        setShowResults(true);
        setIsComplete(true);
      }
    }
  };

  const goToPrevious = () => {
    if (currentAreaIndex > 0) {
      setCurrentAreaIndex(prev => prev - 1);
    } else if (currentStep === 'satisfaction') {
      // Go back to rating step
      setCurrentStep('rating');
      setCurrentAreaIndex(data.length - 1);
    }
  };

  const resetScores = () => {
    setData(initialData);
    setCurrentAreaIndex(0);
    setCurrentStep('rating');
    setShowResults(false);
    setIsComplete(false);
  };

  const handleComplete = async () => {
    const results = {
      lifeAreas: data,
      averageScore: data.reduce((sum, area) => sum + area.score, 0) / data.length,
      satisfactionData: data.map(area => ({
        area: area.area,
        score: area.score,
        satisfaction: area.satisfaction
      })),
      completedAt: new Date().toISOString()
    };

    await updateWheelData(results);
    onComplete(results);
  };

  const getSatisfactionIcon = (satisfaction: string | null) => {
    switch (satisfaction) {
      case 'satisfied': return ThumbsUp;
      case 'want-higher': return TrendingUp;
      case 'want-lower': return ThumbsDown;
      default: return Meh;
    }
  };

  const getSatisfactionColor = (satisfaction: string | null) => {
    switch (satisfaction) {
      case 'satisfied': return 'text-green-600 bg-green-50 border-green-200';
      case 'want-higher': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'want-lower': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getOverallAssessment = () => {
    const average = data.reduce((sum, area) => sum + area.score, 0) / data.length;
    const satisfiedAreas = data.filter(area => area.satisfaction === 'satisfied');
    const wantHigherAreas = data.filter(area => area.satisfaction === 'want-higher');
    const wantLowerAreas = data.filter(area => area.satisfaction === 'want-lower');

    return {
      average: average.toFixed(1),
      satisfiedAreas,
      wantHigherAreas,
      wantLowerAreas,
      assessment: satisfiedAreas.length >= 6 ? 'You\'re satisfied with most areas of your life!' :
                 wantHigherAreas.length >= 4 ? 'You have clear growth opportunities identified' :
                 'You have a mix of satisfaction and growth areas'
    };
  };

  if (showResults) {
    const assessment = getOverallAssessment();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Wheel of Life Results</h1>
            <p className="text-slate-600">Here's your personalized life balance assessment</p>
            {signup && (
              <p className="text-sm text-green-600 mt-2">
                Results saved to {signup.email} • You can access them anytime
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Results Wheel */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900">Your Life Wheel</h3>
                <button
                  onClick={resetScores}
                  className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake</span>
                </button>
              </div>
              
              <div className="flex flex-col items-center">
                <svg
                  width="400"
                  height="400"
                  viewBox="0 0 600 600"
                  className="mb-4"
                >
                  {/* Background rings */}
                  {Array.from({ length: 10 }, (_, ringIndex) => {
                    const ring = ringIndex + 1;
                    const innerRadius = minRadius + (ringIndex * (maxRadius - minRadius)) / 10;
                    const outerRadius = minRadius + ((ringIndex + 1) * (maxRadius - minRadius)) / 10;
                    
                    return (
                      <g key={`ring-${ring}`}>
                        {data.map((segment, segmentIndex) => {
                          const isScored = segment.score >= ring;
                          const path = createSegmentPath(segmentIndex, innerRadius, outerRadius);
                          
                          let fillColor = '#f8fafc';
                          let opacity = 0.3;
                          
                          if (isScored) {
                            fillColor = segment.color;
                            opacity = 0.4 + (ring / 10) * 0.5;
                          }
                          
                          return (
                            <path
                              key={`segment-${segmentIndex}-ring-${ring}`}
                              d={path}
                              fill={fillColor}
                              fillOpacity={opacity}
                              stroke="#e2e8f0"
                              strokeWidth="1"
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

                  {/* Labels */}
                  {data.map((segment, index) => {
                    const { x, y, textAnchor } = getLabelPosition(index);
                    const wrappedText = wrapText(segment.area);
                    const lineHeight = 14;
                    const totalHeight = wrappedText.length * lineHeight;
                    const startY = y - totalHeight / 2 - 5;
                    
                    return (
                      <g key={`label-${index}`}>
                        {wrappedText.map((line, lineIndex) => (
                          <g key={`line-${lineIndex}`}>
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
                          fill={segment.score > 0 ? segment.color : '#64748b'}
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
                    {assessment.average}
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

                {/* Overall Score */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">{assessment.average}/10</div>
                  <div className="text-lg text-slate-700 mb-2">Average Life Score</div>
                  <div className="text-slate-600">{assessment.assessment}</div>
                </div>
              </div>
            </div>

            {/* Satisfaction Insights */}
            <div className="space-y-6">
              {/* Detailed Scores with Satisfaction */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Scores & Satisfaction</h3>
                <div className="space-y-3">
                  {data.map((area, index) => {
                    const SatisfactionIcon = getSatisfactionIcon(area.satisfaction);
                    return (
                      <div key={area.area} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: area.color }}
                          />
                          <span className="font-medium text-slate-900">{area.area}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${area.score * 10}%`,
                                backgroundColor: area.color
                              }}
                            />
                          </div>
                          <span className="font-bold text-slate-900 w-8">{area.score}</span>
                          <div className={`p-1 rounded-full ${getSatisfactionColor(area.satisfaction)}`}>
                            <SatisfactionIcon className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Satisfaction Categories */}
              {assessment.satisfiedAreas.length > 0 && (
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    Areas You're Satisfied With
                  </h3>
                  <div className="space-y-2">
                    {assessment.satisfiedAreas.map(area => (
                      <div key={area.area} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: area.color }}
                        />
                        <span className="text-green-800 font-medium">{area.area}</span>
                        <span className="text-green-600">({area.score}/10)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {assessment.wantHigherAreas.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Areas You Want to Improve
                  </h3>
                  <div className="space-y-2">
                    {assessment.wantHigherAreas.map(area => (
                      <div key={area.area} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: area.color }}
                        />
                        <span className="text-blue-800 font-medium">{area.area}</span>
                        <span className="text-blue-600">({area.score}/10 → Higher)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {assessment.wantLowerAreas.length > 0 && (
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                    <ThumbsDown className="w-5 h-5 mr-2" />
                    Areas You Want to Reduce
                  </h3>
                  <div className="space-y-2">
                    {assessment.wantLowerAreas.map(area => (
                      <div key={area.area} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: area.color }}
                        />
                        <span className="text-orange-800 font-medium">{area.area}</span>
                        <span className="text-orange-600">({area.score}/10 → Lower)</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-orange-700 text-sm mt-3 italic">
                    Sometimes we want to reduce time/energy in certain areas to create better balance.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CTA for Full Platform */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Life?</h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Your assessment shows exactly where to focus. Get the complete Coach Pack toolkit to turn these insights into lasting change.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Values Clarification</h4>
                <p className="text-sm text-purple-100">Discover what truly matters to you</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Vision Board</h4>
                <p className="text-sm text-purple-100">Create visual goals that inspire action</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">12-Week Goals</h4>
                <p className="text-sm text-purple-100">Turn insights into actionable plans</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/pricing"
                className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
              >
                View Pricing Options
              </Link>
              <button 
                onClick={onBackToLanding}
                className="px-8 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors border border-purple-500"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Wheel of Life Assessment</h1>
            <p className="text-sm text-slate-600">
              {currentStep === 'rating' ? 'Step 1: Rate each life area' : 'Step 2: Share your satisfaction'}
            </p>
            {signup && (
              <p className="text-sm text-green-600">Signed up as {signup.email}</p>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-sm text-slate-500">Progress</div>
            <div className="text-lg font-semibold text-slate-900">{Math.round(progress)}% Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-3 mb-8">
          <div 
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interactive Wheel */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="text-center mb-6">
              {currentStep === 'rating' ? (
                <>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Click on the wheel to rate each area</h2>
                  <p className="text-slate-600">Inner rings = lower scores (1-3), outer rings = higher scores (8-10)</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Your completed wheel</h2>
                  <p className="text-slate-600">Now let's understand your satisfaction with each score</p>
                </>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <svg
                ref={svgRef}
                width="500"
                height="500"
                viewBox="0 0 600 600"
                className={`mb-4 ${currentStep === 'rating' ? 'cursor-pointer' : ''}`}
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
                      {data.map((segment, segmentIndex) => {
                        const isHovered = hoveredSegment === segmentIndex && hoveredRing === ring && currentStep === 'rating';
                        const isScored = segment.score >= ring;
                        const isCurrent = segmentIndex === currentAreaIndex;
                        
                        const path = createSegmentPath(segmentIndex, innerRadius, outerRadius); 
                        
                        let fillColor = '#f8fafc';
                        let strokeColor = '#e2e8f0';
                        let opacity = 0.3;
                        let strokeWidth = 1;
                        
                        // Only apply colored fill to rings that are actually scored
                        if (isScored) { 
                          fillColor = segment.color;
                          opacity = 0.4 + (ring / 10) * 0.5;
                        }
                        
                        // Set stroke color and width based on segment state
                        if (segment.score === 0) {
                          // Unscored segments always have neutral gray borders
                          strokeColor = '#e2e8f0';
                          strokeWidth = 1;
                        } else if (isScored) {
                          // Scored segments can have colored borders based on state
                          if (isCurrent && currentStep === 'satisfaction') {
                            strokeColor = segment.darkColor;
                            strokeWidth = 3;
                          } else if (isCurrent) {
                            strokeColor = segment.darkColor;
                            strokeWidth = 2;
                          }
                          
                          // Apply hover effect only during rating step and only for scored segments
                          if (isHovered && currentStep === 'rating') {
                            opacity = Math.max(opacity, 0.9);
                            strokeColor = segment.darkColor;
                            strokeWidth = 3;
                          }
                        }
                        
                        return (
                          <path
                            key={`segment-${segmentIndex}-ring-${ring}`}
                            d={path}
                            fill={fillColor}
                            fillOpacity={opacity}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
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

                {/* Labels */}
                {data.map((segment, index) => {
                  const { x, y, textAnchor } = getLabelPosition(index);
                  const wrappedText = wrapText(segment.area);
                  const lineHeight = 14;
                  const totalHeight = wrappedText.length * lineHeight;
                  const startY = y - totalHeight / 2 - 5;
                  const isCurrent = index === currentAreaIndex;
                  
                  return (
                    <g key={`label-${index}`}>
                      {wrappedText.map((line, lineIndex) => (
                        <g key={`line-${lineIndex}`}>
                          <text
                            x={x}
                            y={startY + (lineIndex * lineHeight)}
                            textAnchor={textAnchor}
                            dominantBaseline="middle"
                            className={`text-sm font-bold pointer-events-none ${isCurrent ? 'animate-pulse' : ''}`}
                            fill="white"
                            stroke="white"
                            strokeWidth="3"
                          >
                            {line}
                          </text>
                          <text
                            x={x}
                            y={startY + (lineIndex * lineHeight)}
                            textAnchor={textAnchor}
                            dominantBaseline="middle"
                            className={`text-sm font-bold pointer-events-none ${isCurrent ? 'animate-pulse' : ''}`}
                            fill={isCurrent ? segment.color : segment.darkColor}
                          >
                            {line}
                          </text>
                        </g>
                      ))}
                      
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
                        Score: {segment.score || '-'}
                      </text>
                      <text
                        x={x}
                        y={y + totalHeight / 2 + 8}
                        textAnchor={textAnchor}
                        dominantBaseline="middle"
                        className="text-xs font-semibold pointer-events-none"
                        fill={segment.color}
                      >
                        Score: {segment.score || '-'}
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
                  {data.filter(area => area.score > 0).length > 0 
                    ? (data.reduce((sum, area) => sum + area.score, 0) / data.filter(area => area.score > 0).length).toFixed(1)
                    : '-'
                  }
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

              {/* Hover tooltip for rating step */}
              {hoveredSegment !== null && hoveredRing !== null && currentStep === 'rating' && (
                <div className="mt-4 p-3 bg-slate-900 text-white rounded-lg text-sm font-medium">
                  Click to set <strong>{data[hoveredSegment]?.area}</strong> to score <strong>{hoveredRing}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Current Area Focus */}
                  })}
                </div>

                {/* Current Score Display */}
                <div className="text-center mb-6">
                  <div className="text-sm text-slate-500 mb-1">Current Score</div>
                  <div 
                    className="text-4xl font-bold px-4 py-2 rounded-lg inline-block"
                    style={{ 
                      color: currentArea.score > 0 ? currentArea.color : '#64748b',
                      backgroundColor: currentArea.score > 0 ? currentArea.lightColor : '#f1f5f9'
                    }}
                  >
                    {currentArea.score || '-'}/10
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPrevious}
                    disabled={currentAreaIndex === 0}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={goToNext}
                    disabled={currentArea.score === 0}
                    className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    <span>{currentAreaIndex === data.length - 1 ? 'Continue' : 'Next Area'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Satisfaction Step */
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="text-center mb-6">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: currentArea.color }}
                  >
                    {currentArea.score}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentArea.area}</h2>
                  <p className="text-slate-600 mb-4">
                    You rated this area <strong>{currentArea.score}/10</strong>. How do you feel about this score?
                  </p>
                </div>

                {/* Satisfaction Options */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => updateSatisfaction('satisfied')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      currentArea.satisfaction === 'satisfied'
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-slate-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ThumbsUp className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold">I'm satisfied with this score</div>
                        <div className="text-sm opacity-75">This area is working well for me right now</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => updateSatisfaction('want-higher')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      currentArea.satisfaction === 'want-higher'
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold">I'd like this score to be higher</div>
                        <div className="text-sm opacity-75">I want to improve and grow in this area</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => updateSatisfaction('want-lower')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      currentArea.satisfaction === 'want-lower'
                        ? 'border-orange-500 bg-orange-50 text-orange-800'
                        : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ThumbsDown className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-semibold">I'd like this score to be lower</div>
                        <div className="text-sm opacity-75">I want to reduce time/energy in this area for better balance</div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPrevious}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={goToNext}
                    disabled={currentArea.satisfaction === null}
                    className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    <span>{currentAreaIndex === data.length - 1 ? 'See Results' : 'Next Area'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Progress Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Progress</h3>
              <div className="space-y-3">
                {data.map((area, index) => {
                  const SatisfactionIcon = getSatisfactionIcon(area.satisfaction);
                  return (
                    <div 
                      key={area.area}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        index === currentAreaIndex 
                          ? 'border-purple-300 bg-purple-50' 
                          : area.score > 0 && (currentStep === 'rating' || area.satisfaction !== null)
                          ? 'border-green-200 bg-green-50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: area.color }}
                        />
                        <span className="font-medium text-slate-900">{area.area}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="font-bold" style={{ color: area.score > 0 ? area.color : '#64748b' }}>
                          {area.score > 0 ? `${area.score}/10` : 'Not rated'}
                        </div>
                        {currentStep === 'satisfaction' && (
                          <div className={`p-1 rounded-full ${getSatisfactionColor(area.satisfaction)}`}>
                            <SatisfactionIcon className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeWheelAssessment;