import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Target, Sparkles } from 'lucide-react';

const FreeAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentArea, setCurrentArea] = useState(0);
  const [scores, setScores] = useState<number[]>(new Array(8).fill(0));

  const lifeAreas = [
    'Career', 'Finances', 'Health', 'Family', 
    'Romance', 'Personal Growth', 'Fun & Recreation', 'Environment'
  ];

  const handleScoreChange = (score: number) => {
    const newScores = [...scores];
    newScores[currentArea] = score;
    setScores(newScores);
  };

  const nextArea = () => {
    if (currentArea < lifeAreas.length - 1) {
      setCurrentArea(currentArea + 1);
    }
  };

  const prevArea = () => {
    if (currentArea > 0) {
      setCurrentArea(currentArea - 1);
    }
  };

  const isComplete = scores.every(score => score > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-purple-400" />
            <Sparkles className="w-6 h-6 text-orange-400" />
          </div>
        </div>

        {/* Assessment Content */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Free Wheel of Life Assessment</h1>
            <p className="text-slate-600">Rate your satisfaction in each area of life from 1-10</p>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentArea + 1) / lifeAreas.length) * 100}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-2">Area {currentArea + 1} of {lifeAreas.length}</p>
          </div>

          {/* Current Area */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{lifeAreas[currentArea]}</h2>
            <p className="text-slate-600 mb-6">How satisfied are you with this area of your life?</p>
            
            {/* Score Buttons */}
            <div className="flex justify-center space-x-2 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                <button
                  key={score}
                  onClick={() => handleScoreChange(score)}
                  className={`w-12 h-12 rounded-full border-2 font-semibold transition-all ${
                    scores[currentArea] === score
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'border-slate-300 text-slate-600 hover:border-purple-400 hover:text-purple-600'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevArea}
              disabled={currentArea === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentArea === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Previous
            </button>
            
            {currentArea < lifeAreas.length - 1 ? (
              <button
                onClick={nextArea}
                disabled={scores[currentArea] === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  scores[currentArea] === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => navigate('/wheel-of-life')}
                disabled={!isComplete}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  !isComplete
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Complete Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeAssessmentPage;