import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

const VisionBoard: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Vision Board</h1>
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-center mb-4">
          <ImageIcon className="w-8 h-8 text-teal-600" />
        </div>
        <p className="text-center text-slate-600">
          Create a visual representation of your goals and aspirations.
        </p>
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-500 text-center">
            This component is currently being updated. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisionBoard;