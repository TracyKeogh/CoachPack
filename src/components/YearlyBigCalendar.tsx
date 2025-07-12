import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface YearlyBigCalendarProps {
  currentYear: number;
  onDateClick: (date: Date) => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  onBackToWeek: () => void;
}

const YearlyBigCalendar: React.FC<YearlyBigCalendarProps> = ({
  currentYear,
  onDateClick,
  onPrevYear,
  onNextYear,
  onBackToWeek
}) => {
  const today = new Date();
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  // Function to check if a date is valid
  const isValidDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    return date.getMonth() === month && date.getDate() === day;
  };

  // Function to check if a date is today
  const isToday = (year: number, month: number, day: number) => {
    return year === today.getFullYear() && 
           month === today.getMonth() && 
           day === today.getDate();
  };

  // Function to check if a day should have a blue background (weekends)
  // In this specific calendar, days 6-7, 13-14, 20-21, 27-28 are highlighted
  const isWeekendDay = (day: number) => {
    return [6, 7, 13, 14, 20, 21, 27, 28].includes(day);
  };

  // Generate day headers (1-31)
  const renderDayHeaders = () => {
    const headers = [];
    for (let day = 1; day <= 31; day++) {
      headers.push(
        <div key={`header-${day}`} className="text-center text-xs font-medium text-slate-600 py-1">
          {day}
        </div>
      );
    }
    return headers;
  };

  // Render a month row
  const renderMonth = (monthIndex: number) => {
    const cells = [];
    
    // Add month name cell
    cells.push(
      <div key={`month-${monthIndex}`} className="text-left pr-2 font-medium text-slate-700">
        {months[monthIndex]}
      </div>
    );
    
    // Add day cells for this month
    for (let day = 1; day <= 31; day++) {
      const isValid = isValidDate(currentYear, monthIndex, day);
      const isTodayDate = isToday(currentYear, monthIndex, day);
      const isWeekend = isWeekendDay(day);
      
      cells.push(
        <div 
          key={`day-${monthIndex}-${day}`}
          className={`
            text-center text-sm border border-slate-100
            ${isValid ? 'cursor-pointer hover:bg-slate-100' : 'opacity-0'}
            ${isTodayDate ? 'bg-purple-100 font-bold text-purple-800' : ''}
            ${isWeekend && !isTodayDate ? 'bg-blue-50' : ''}
          `}
          onClick={() => isValid ? onDateClick(new Date(currentYear, monthIndex, day)) : null}
        >
          {isValid ? day : ''}
        </div>
      );
    }
    
    return cells;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onPrevYear}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-3xl font-bold text-blue-600">THE BIG CALENDAR {currentYear}</h2>
          <button 
            onClick={onNextYear}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onDateClick(today)}
            className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Today
          </button>
          <button 
            onClick={onBackToWeek}
            className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Back to Week
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-[auto_repeat(31,1fr)] gap-px">
        {/* Empty cell for top-left corner */}
        <div className=""></div>
        
        {/* Day headers */}
        {renderDayHeaders()}
        
        {/* Month rows */}
        {months.map((_, monthIndex) => renderMonth(monthIndex))}
      </div>
    </div>
  );
};

export default YearlyBigCalendar;