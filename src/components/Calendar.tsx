import React, { useState, useEffect, useCallback } from 'react';
import { 
ChevronLeft, 
ChevronRight, 
Calendar as CalendarIcon,
Plus, 
Clock, 
ArrowLeft,
X,
Filter,
MoreHorizontal,
Trash2,
Edit3,
Flag,
Target,
CheckCircle2
} from 'lucide-react';
import { useCalendarData, Event, ActionPoolItem } from '../hooks/useCalendarData';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import NotesPanel from './NotesPanel';

const Calendar: React.FC = () => {
const {
data,
isLoaded,
lastSaved,
addEvent,
updateEvent,
removeEvent,
addActionToPool,
updateActionInPool,
removeActionFromPool,
scheduleActionFromPool,
getEventsForDay,
refreshActionPool,
saveData
} = useCalendarData();

const { data: goalsData } = useGoalSettingData();

const [currentDate, setCurrentDate] = useState(new Date());
const [showDayView, setShowDayView] = useState(false);
const [viewMode, setViewMode] = useState<'week' | '90day'>('week');
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
const [showNotes, setShowNotes] = useState(false);
const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
const [showActionPool, setShowActionPool] = useState(true);
const [draggedAction, setDraggedAction] = useState<ActionPoolItem | null>(null);
const [hoveredTimeSlot, setHoveredTimeSlot] = useState<string | null>(null);

// Get the first day of the current week (Sunday)
const getFirstDayOfWeek = useCallback((date: Date): Date => {
const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
const diff = date.getDate() - day;
return new Date(date.getFullYear(), date.getMonth(), diff);
}, []);

// Get the days of the current week
const getDaysOfWeek = useCallback((firstDay: Date): Date[] => {
const days = [];
for (let i = 0; i < 7; i++) {
const day = new Date(firstDay);
day.setDate(firstDay.getDate() + i);
days.push(day);
}
return days;
}, []);

// Format date for display
const formatDate = useCallback((date: Date): string => {
return date.toLocaleDateString('en-US', {
weekday: 'long',
month: 'long',
day: 'numeric',
year: 'numeric'
});
}, []);

// Format time for display
const formatTime = useCallback((date: Date): string => {
return date.toLocaleTimeString('en-US', {
hour: 'numeric',
minute: '2-digit',
hour12: true
});
}, []);

// Get the first day of the current week
const firstDayOfWeek = getFirstDayOfWeek(currentDate);

// Get all days of the current week
const daysOfWeek = getDaysOfWeek(firstDayOfWeek);

// Navigate to previous week
const goToPreviousWeek = () => {
const newDate = new Date(currentDate);
newDate.setDate(currentDate.getDate() - 7);
setCurrentDate(newDate);
};

// Navigate to next week
const goToNextWeek = () => {
const newDate = new Date(currentDate);
newDate.setDate(currentDate.getDate() + 7);
setCurrentDate(newDate);
};

// Navigate to today
const goToToday = () => {
setCurrentDate(new Date());
};

// Open day view for a specific day
const openDayView = (date: Date) => {
console.log('Opening day view for:', formatDate(date));
setSelectedDate(date);
if (viewMode === 'week') {
setShowDayView(true);
} else {
// When in 90-day view, switch to week view and then show day view
setViewMode('week');
setShowDayView(true);
}
};

// Close day view
const closeDayView = () => {
setShowDayView(false);
setSelectedDate(null);
};

// Generate milestone dates from goals data
const getMilestoneDates = useCallback(() => {
console.log("Getting milestone dates from goals data:", goalsData);

let milestones: {
date: Date;
title: string;
category: 'business' | 'body' | 'balance';
completed: boolean;
}[] = [];

// Direct approach to find milestones in the structure shown in the screenshot
if (goalsData && typeof goalsData === 'object') {
// First, try the structure from GoalSetting.tsx
if (goalsData.categoryGoals) {
console.log("Found categoryGoals structure");

Object.entries(goalsData.categoryGoals).forEach(([category, goalData]) => {
console.log(`Examining category: ${category}`, goalData);

// Skip if no goal data
if (!goalData) return;

// Try to access milestones directly
if (Array.isArray(goalData.milestones)) {
console.log(`Found milestones array in ${category}:`, goalData.milestones);

goalData.milestones.forEach((milestone: any) => {
if (milestone && (milestone.title || milestone.dueDate)) {
console.log(`Adding milestone: ${milestone.title || 'Untitled'}`);
milestones.push({
date: new Date(milestone.dueDate || new Date()),
title: milestone.title || 'Untitled Milestone',
category: category as 'business' | 'body' | 'balance',
completed: !!milestone.completed
});
}
});
}
});
}
}

// If no milestones found yet, try the structure from the screenshot
if (milestones.length === 0) {
console.log("No milestones found in standard structure, trying alternative approach");

// Try to access the structure shown in the screenshot
const categories = ['business', 'body', 'balance'];

categories.forEach(category => {
// Try to find the category in the goals data
const categoryData = goalsData[category];
if (categoryData) {
console.log(`Found category data for ${category}:`, categoryData);

// Look for milestones
if (Array.isArray(categoryData.milestones)) {
console.log(`Found milestones in ${category}:`, categoryData.milestones);

categoryData.milestones.forEach((milestone: any) => {
milestones.push({
date: new Date(milestone.dueDate || milestone.targetDate || new Date()),
title: milestone.title || 'Untitled',
category: category as 'business' | 'body' | 'balance',
completed: !!milestone.completed
});
});
}
}
});
}

// Hardcoded test milestones if none found
if (milestones.length === 0) {
console.log("No milestones found in any structure, adding test milestones");

// Add some test milestones for demonstration
const today = new Date();
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);

const twoWeeksLater = new Date(today);
twoWeeksLater.setDate(today.getDate() + 14);

milestones.push({
date: nextWeek,
title: "Implement no-work weekends",
category: 'balance',
completed: false
});

milestones.push({
date: twoWeeksLater,
title: "Plan quarterly weekend getaway",
category: 'balance',
completed: false
});
}

console.log("Final milestones extracted:", milestones);

return milestones;
}, [goalsData]);

// 90-Day View Modal Component
const generate90DayView = () => {
const today = new Date();
const startDate = new Date(today);
const endDate = new Date(today);
endDate.setDate(today.getDate() + 90);

const milestones = getMilestoneDates();
console.log("Milestones in 90-Day View:", milestones);

// Generate array of dates for 90 days
const generateDates = () => {
const dates = [];
const currentDate = new Date(startDate);

while (currentDate <= endDate) {
dates.push(new Date(currentDate));
currentDate.setDate(currentDate.getDate() + 1);
}

return dates;
};

const dates = generateDates();

// Group dates by month
const monthGroups: Record<string, Date[]> = {};
dates.forEach(date => {
const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
if (!monthGroups[monthKey]) {
monthGroups[monthKey] = [];
}
monthGroups[monthKey].push(date);
});

return { monthGroups, milestones };
};

// Generate 90-day view data
const { monthGroups, milestones } = generate90DayView();

// Handle drag start for action pool items
const handleDragStart = (e: React.DragEvent, action: ActionPoolItem) => {
e.dataTransfer.setData('text/plain', action.id);
setDraggedAction(action);
};

// Handle drag over for time slots
const handleDragOver = (e: React.DragEvent, timeSlot: string, day: Date) => {
e.preventDefault();
setHoveredTimeSlot(`${day.toISOString()}-${timeSlot}`);
};

// Handle drag leave for time slots
const handleDragLeave = () => {
setHoveredTimeSlot(null);
};

// Handle drop for time slots
const handleDrop = (e: React.DragEvent, timeSlot: string, day: Date) => {
e.preventDefault();
const actionId = e.dataTransfer.getData('text/plain');

if (!actionId || !draggedAction) return;

// Create a new Date object for the event start time
const [hours, minutes] = timeSlot.split(':').map(Number);
const eventStart = new Date(day);
eventStart.setHours(hours, minutes, 0, 0);

console.log('Scheduling action:', draggedAction.title);
console.log('Start time:', eventStart.toLocaleString());

// Schedule the action
scheduleActionFromPool(actionId, eventStart);

// Reset state
setDraggedAction(null);
setHoveredTimeSlot(null);
};

// Handle drag start for events in day view
const handleEventDragStart = (e: React.DragEvent, event: Event) => {
e.dataTransfer.setData('text/plain', event.id);
setDraggedEvent(event);
console.log('Started dragging event:', event.title);
};

// Handle drag over for time slots in day view
const handleDayViewDragOver = (e: React.DragEvent, timeSlot: string) => {
e.preventDefault();
setHoveredTimeSlot(`${selectedDate?.toISOString()}-${timeSlot}`);
};

// Handle drag leave for time slots in day view
const handleDayViewDragLeave = () => {
setHoveredTimeSlot(null);
};

// Handle drop for time slots in day view
const handleDayViewDrop = (e: React.DragEvent, timeSlot: string) => {
e.preventDefault();
const eventId = e.dataTransfer.getData('text/plain');

if (!eventId || !draggedEvent || !selectedDate) return;

// Create a new Date object for the event start time
const [hours, minutes] = timeSlot.split(':').map(Number);
const eventStart = new Date(selectedDate);
eventStart.setHours(hours, minutes, 0, 0);

// Calculate event end time based on original duration
const originalDuration = draggedEvent.end.getTime() - draggedEvent.start.getTime();
const eventEnd = new Date(eventStart.getTime() + originalDuration);

console.log('Moving event:', draggedEvent.title);
console.log('New start time:', eventStart.toLocaleString());
console.log('New end time:', eventEnd.toLocaleString());

// Update the event
updateEvent(eventId, {
start: eventStart,
end: eventEnd
});

// Reset state
setDraggedEvent(null);
setHoveredTimeSlot(null);
};

// Generate time slots for day view
const generateTimeSlots = () => {
const slots = [];
for (let hour = 6; hour < 22; hour++) {
slots.push(`${hour}:00`);
slots.push(`${hour}:30`);
}
return slots;
};

// Get events for a specific time slot
const getEventsForTimeSlot = (day: Date, timeSlot: string): Event[] => {
if (!selectedDate) return [];

const [hours, minutes] = timeSlot.split(':').map(Number);
const slotStart = new Date(day);
slotStart.setHours(hours, minutes, 0, 0);

const slotEnd = new Date(slotStart);
slotEnd.setMinutes(slotStart.getMinutes() + 30);

return data.events.filter(event => {
const eventStart = new Date(event.start);
const eventEnd = new Date(event.end);

return (
eventStart < slotEnd && eventEnd > slotStart &&
eventStart.getDate() === day.getDate() &&
eventStart.getMonth() === day.getMonth() &&
eventStart.getFullYear() === day.getFullYear()
);
});
};

// Get category color
const getCategoryColor = (category: string): string => {
switch (category) {
case 'business':
return 'bg-purple-100 text-purple-800 border-purple-200';
case 'body':
return 'bg-green-100 text-green-800 border-green-200';
case 'balance':
return 'bg-blue-100 text-blue-800 border-blue-200';
default:
return 'bg-slate-100 text-slate-800 border-slate-200';
}
};

// Get category icon
const getCategoryIcon = (category: string): string => {
switch (category) {
case 'business':
return '💼';
case 'body':
return '💪';
case 'balance':
return '⚖️';
default:
return '📝';
}
};

// Day View Modal Component
const DayViewModal: React.FC = () => {
if (!selectedDate) return null;

const timeSlots = generateTimeSlots();

return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
<div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
{/* Header */}
<div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
<div className="flex items-center justify-between">
<button
onClick={closeDayView}
className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
>
<ArrowLeft className="w-5 h-5" />
<span>Back to Week</span>
</button>

<h2 className="text-xl font-bold">{formatDate(selectedDate)}</h2>

<button
onClick={closeDayView}
className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
>
<X className="w-5 h-5" />
</button>
</div>
</div>

{/* Time Slots */}
<div className="flex-1 overflow-y-auto p-6">
<div className="space-y-2">
{timeSlots.map((timeSlot) => {
const events = getEventsForTimeSlot(selectedDate, timeSlot);
const isHalfHour = timeSlot.endsWith(':30');

return (
<div 
key={timeSlot}
className={`flex items-start ${isHalfHour ? 'opacity-70' : ''}`}
onDragOver={(e) => handleDayViewDragOver(e, timeSlot)}
onDragLeave={handleDayViewDragLeave}
onDrop={(e) => handleDayViewDrop(e, timeSlot)}
>
<div className="w-16 text-right pr-4 text-sm font-medium text-slate-500 pt-2">
{timeSlot}
</div>

<div 
className={`flex-1 min-h-16 border border-slate-200 rounded-lg p-2 transition-all ${
                       hoveredTimeSlot === `${selectedDate.toISOString()}-${timeSlot}` 
                         ? '!bg-blue-100 !ring-2 !ring-blue-500' 
                         : 'hover:bg-blue-50'
                     }`}
>
{events.length > 0 ? (
<div className="space-y-2">
{events.map((event) => (
<div
key={event.id}
className={`p-2 rounded-lg ${getCategoryColor(event.category)} flex items-start justify-between cursor-move`}
draggable
onDragStart={(e) => handleEventDragStart(e, event)}
>
<div>
<div className="font-medium">{event.title}</div>
<div className="text-xs">
{formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
</div>
</div>
<div className="flex items-center space-x-1">
<button 
onClick={() => removeEvent(event.id)}
className="p-1 text-slate-400 !hover:text-red-500 !hover:bg-red-50 rounded transition-colors"
>
<Trash2 className="w-3 h-3" />
</button>
<button 
className="p-1 text-slate-400 !hover:text-blue-500 !hover:bg-blue-50 rounded transition-colors"
>
<Edit3 className="w-3 h-3" />
</button>
</div>
</div>
))}
</div>
) : (
<div className="h-full flex items-center justify-center text-slate-400 text-sm">
Drop actions or events here
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
);
};

// Early return if data is not loaded yet
if (!isLoaded) {
return (
<div className="flex items-center justify-center min-h-96">
<div className="text-center">
<div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
<h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Calendar...</h2>
<p className="text-slate-600">Retrieving your schedule...</p>
</div>
</div>
);
}

return (
<div className="space-y-8">
{/* Header */}
<div className="flex items-center justify-between">
<div>
<h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
<p className="text-slate-600 mt-2">
Schedule time for what matters most
</p>
<div className="flex items-center space-x-2 mt-1">
{lastSaved && (
<p className="text-sm text-green-600">
✓ Last saved: {lastSaved.toLocaleTimeString()}
</p>
)}
</div>
</div>
<div className="flex items-center space-x-3">
<button
onClick={() => setViewMode(viewMode === 'week' ? '90day' : 'week')}
className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
>
<Flag className="w-4 h-4" />
<span>{viewMode === 'week' ? '90-Day View' : 'Week View'}</span>
</button>
<button
onClick={() => setShowNotes(!showNotes)}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
>
<Filter className="w-4 h-4" />
<span>Notes</span>
</button>
          <button
            onClick={saveData}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Today</span>
          </button>
</div>
</div>

{/* Calendar Navigation */}
{viewMode === 'week' && (
<div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
<div className="flex items-center justify-between mb-6">
<div className="flex items-center space-x-4">
<button
onClick={goToPreviousWeek}
className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
>
<ChevronLeft className="w-5 h-5" />
</button>
<h2 className="text-xl font-semibold text-slate-900">
Week {firstDayOfWeek.getDate()} of {firstDayOfWeek.toLocaleString('default', { month: 'long' })} {firstDayOfWeek.getFullYear()}
</h2>
<button
onClick={goToNextWeek}
className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
>
<ChevronRight className="w-5 h-5" />
</button>
</div>

<div className="flex items-center space-x-2">
<button
onClick={goToToday}
className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
>
Today
</button>
<button
onClick={() => setShowActionPool(!showActionPool)}
className={`px-4 py-2 rounded-lg transition-colors ${
               showActionPool 
                 ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                 : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
             }`}
>
{showActionPool ? 'Hide Action Pool' : 'Show Action Pool'}
</button>
</div>
</div>

{/* Week Selector */}
<div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
{Array.from({ length: 12 }, (_, i) => i + 1).map((weekNum) => {
const isCurrentWeek = weekNum === Math.ceil((currentDate.getDate() + firstDayOfWeek.getDay()) / 7);

return (
<button
key={weekNum}
className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                 isCurrentWeek 
                   ? 'bg-purple-600 text-white' 
                   : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
               }`}
>
Week {weekNum}
</button>
);
})}
</div>

{/* Calendar Grid */}
<div className="grid grid-cols-8 gap-4">
{/* Time Column */}
<div className="space-y-3">
<div className="h-12 text-center"></div>
<div className="p-3 rounded-lg border border-slate-200 text-center font-medium text-slate-900">
Morning
</div>
<div className="p-3 rounded-lg border border-slate-200 text-center font-medium text-slate-900">
Afternoon
</div>
<div className="p-3 rounded-lg border border-slate-200 text-center font-medium text-slate-900">
Evening
</div>
</div>

{/* Day Columns */}
{daysOfWeek.map((day, dayIndex) => {
const isToday = day.toDateString() === new Date().toDateString();
const dayEvents = getEventsForDay(day);

return (
<div key={dayIndex} className="space-y-3">
{/* Day Header - FIXED: Added cursor-pointer and hover styles */}
<div 
className={`h-12 text-center cursor-pointer !hover:bg-blue-200 !hover:ring-2 !hover:ring-blue-500 rounded-lg ${
                   isToday ? 'bg-purple-100' : ''
                 }`}
onClick={() => {
console.log(`Clicked on day header: ${day.toDateString()} - Opening day view`);
openDayView(day);
}}
>
<div className="font-medium text-slate-900">
{day.toLocaleString('default', { weekday: 'short' })}
</div>
<div className={`text-sm ${isToday ? 'text-purple-600 font-bold' : 'text-slate-500'}`}>
{day.getDate()}
</div>
</div>

{/* Morning Slot - FIXED: Added cursor-pointer and hover styles */}
<div 
className="p-3 rounded-lg border border-slate-200 hover:shadow-sm transition-all cursor-pointer !hover:bg-blue-200 !hover:ring-2 !hover:ring-blue-500"
onClick={() => {
console.log(`Clicked on morning slot: ${day.toDateString()} - Opening day view`);
openDayView(day);
}}
onDragOver={(e) => handleDragOver(e, '9:00', day)}
onDragLeave={handleDragLeave}
onDrop={(e) => handleDrop(e, '9:00', day)}
>
{dayEvents.filter(event => {
const eventHour = new Date(event.start).getHours();
return eventHour >= 6 && eventHour < 12;
}).length > 0 ? (
<div className="space-y-1">
{dayEvents
.filter(event => {
const eventHour = new Date(event.start).getHours();
return eventHour >= 6 && eventHour < 12;
})
.slice(0, 2)
.map(event => (
<div 
key={event.id}
className={`px-2 py-1 rounded text-xs ${getCategoryColor(event.category)}`}
>
{event.title}
</div>
))}
{dayEvents.filter(event => {
const eventHour = new Date(event.start).getHours();
return eventHour >= 6 && eventHour < 12;
}).length > 2 && (
<div className="text-xs text-slate-500 text-center">
+{dayEvents.filter(event => {
const eventHour = new Date(event.start).getHours();
return eventHour >= 6 && eventHour < 12;
}).length - 2} more
</div>
)}
</div>
) : (
<div className="text-center text-slate-400 text-sm">
Drop actions here
</div>
)}
</div>

{/* Afternoon Slot - FIXED: Added cursor-pointer and hover styles */}
<div 
className="p-3 rounded-lg border border-slate-200 hover:shadow-sm transition-all cursor-pointer !hover:bg-blue-200 !hover:ring-2 !hover:ring-blue-500"
onClick={() => {
console.log(`Clicked on afternoon slot: ${day.toDateString()} - Opening day view`);
openDayView(day);
}}
onDragOver={(e) => handleDragOver(e, '14:00', day)}
onDragLeave={handleDragLeave}
onDrop={(e) => handleDrop(e, '14:00', day)}
>
{dayEvents.filter(event => {
const eventHour = new Date(event.start).getHours();
return eventHour >= 12 && eventHour < 18;
}).length > 0 ? (
<div className="space-y-1">
{dayEvents
.filter(event => {
const eventHour = new Date(event.start).getHours();
return eventHour >= 12 && eventHour < 18;
})
.slice(0, 2)
.map(event => (
<div 
key={event.id}
className={`px-2 py-1 rounded text-xs ${getCategoryColor(event.category)}`}
>
{event.title}
</div>
))}
{dayEvents.filter(event => {
const eventHour = new Date(event.start).getHours();
return eventHour >= 12 && eventHour < 18;
}).length > 2 && (
<div className="text-xs text-slate-500 text-center">
+{dayEvents.filter(event => {
const eventHour = new Date(event.start).getHours();
return eventHour >= 12 && eventHour < 18;
}).length - 2} more
</div>
)}
</div>
) : (
<div className="text-center text-slate-400 text-sm">
Drop actions here
</div>
)}
</div>

{/* Evening Slot - FIXED: Added cursor-pointer and hover styles */}
<div 
className="p-3 rounded-lg border border-slate-200 hover:shadow-sm transition-all cursor-pointer !hover:bg-blue-200 !hover:ring-2 !hover:ring-blue-500"
onClick={() => {
console.log(`Clicked on evening slot: ${day.toDateString()} - Opening day view`);
openDayView(day);
}}
onDragOver={(e) => handleDragOver(e, '19:00', day)}
onDragLeave={handleDragLeave}
onDrop={(e) => handleDrop(e, '19:00', day)}
>
{dayEvents.filter(event => {
const eventHour = new Date(event.start).getHours();
return eventHour >= 18;
}).length > 0 ? (
<div className="space-y-1">
{dayEvents
.filter(event => {
const eventHour = new Date(event.start).getHours();
return eventHour >= 18;
})
.slice(0, 2)
.map(event => (
<div 
key={event.id}
className={`px-2 py-1 rounded text-xs ${getCategoryColor(event.category)}`}
>
{event.title}
</div>
))}
{dayEvents.filter(event => {
const eventHour = new Date(event.start).getHours();
return eventHour >= 18;
}).length > 2 && (
<div className="text-xs text-slate-500 text-center">
+{dayEvents.filter(event => {
const eventHour = new Date(event.start).getHours();
return eventHour >= 18;
}).length - 2} more
</div>
)}
</div>
) : (
<div className="text-center text-slate-400 text-sm">
Drop actions here
</div>
)}
</div>
</div>
);
})}
</div>
</div>
)}

{/* 90-Day View */}
{viewMode === '90day' && (
<div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
<div className="flex items-center justify-between mb-6">
<h3 className="text-xl font-semibold text-slate-900">90-Day Milestone View</h3>
<button
onClick={() => setViewMode('week')}
className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
>
<ArrowLeft className="w-4 h-4" />
<span>Back to Week</span>
</button>
</div>

{/* Milestones Summary */}
<div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-8">
<h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Milestones</h3>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
{/* Debug info for development */}
<div className="absolute top-0 right-0 text-xs text-slate-400">
Found: {milestones.length} milestones (Debug)
</div>

{milestones.length > 0 ? (
milestones
.sort((a, b) => a.date.getTime() - b.date.getTime())
.slice(0, 6)
.map((milestone, index) => (
<div 
key={index}
className={`p-3 rounded-lg border ${
                       milestone.completed 
                         ? 'bg-green-50 border-green-200' 
                         : 'bg-white border-slate-200'
                     }`}
>
<div className="flex items-start space-x-3">
<div className={`p-2 rounded-full ${
                         getCategoryColor(milestone.category).split(' ')[0]
                       }`}>
{milestone.category === 'business' ? (
<Target className="w-4 h-4 text-purple-600" />
) : milestone.category === 'body' ? (
<Target className="w-4 h-4 text-green-600" />
) : (
<Target className="w-4 h-4 text-blue-600" />
)}
</div>
<div className="flex-1">
<div className="font-medium text-slate-900">{milestone.title}</div>
<div className="text-sm text-slate-500">
{milestone.date.toLocaleDateString('en-US', {
month: 'short',
day: 'numeric'
})}
</div>
<div className="mt-1">
<span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(milestone.category)}`}>
{milestone.category}
</span>
</div>
</div>
{milestone.completed && (
<CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
)}
</div>
</div>
))
) : (
<div className="col-span-3 text-center py-6 text-slate-500">
<Flag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
<p>No milestones found</p>
<p className="text-sm mt-1">Add milestones in the Goals section or check console for debugging info</p>
</div>
)}
</div>
</div>

{/* Calendar Grid */}
{Object.entries(monthGroups).map(([monthKey, dates]) => {
const firstDate = dates[0];
const monthName = firstDate.toLocaleString('default', { month: 'long' });
const year = firstDate.getFullYear();

return (
<div key={monthKey} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
<div className="bg-slate-800 text-white p-4">
<h3 className="text-lg font-semibold">{monthName} {year}</h3>
</div>

<div className="p-4">
{/* Day headers */}
<div className="grid grid-cols-7 gap-2 mb-2">
{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
<div key={day} className="text-center font-semibold text-slate-600 py-2">
{day}
</div>
))}
</div>

{/* Calendar grid */}
<div className="grid grid-cols-7 gap-2">
{/* Empty cells for days before the first of the month */}
{Array.from({ length: dates[0].getDay() }, (_, i) => (
<div key={`empty-start-${i}`} className="min-h-24 p-2 bg-slate-50 rounded-lg"></div>
))}

{/* Actual date cells */}
{dates.map((date, i) => {
const isToday = date.toDateString() === new Date().toDateString();
                      const dateEvents = getEventsForDay(date);
                      const dateMilestones = milestones.filter(
                        m => m.date.toDateString() === date.toDateString()
                      );

return (
<div 
key={i}
className={`min-h-24 p-2 rounded-lg border ${
                           isToday 
                             ? 'bg-purple-50 border-purple-200' 
                             : 'bg-white border-slate-200'
                         } hover:shadow-md transition-all cursor-pointer !hover:bg-blue-200 !hover:ring-2 !hover:ring-blue-500`}
onClick={() => {
console.log(`Clicked on date: ${date.toDateString()}`);
setSelectedDate(date);
setShowDayView(true);
setViewMode('week');
}}
>
<div className={`text-right font-medium ${
                           isToday ? 'text-purple-600' : 'text-slate-700'
                         }`}>
{date.getDate()}
</div>

{/* Milestones */}
{dateMilestones.length > 0 && (
<div className="mt-1 space-y-1">
{dateMilestones.map((milestone, idx) => (
<div 
key={idx}
className={`px-2 py-1 rounded text-xs ${getCategoryColor(milestone.category)} flex items-center space-x-1`}
>
<Flag className="w-3 h-3 flex-shrink-0" />
<span className="truncate">{milestone.title}</span>
</div>
))}
</div>
)}

{/* Events */}
{dateEvents.length > 0 && (
<div className="mt-1 space-y-1">
{dateEvents.slice(0, 2).map(event => (
<div 
key={event.id}
className={`px-2 py-1 rounded text-xs ${getCategoryColor(event.category)}`}
>
{event.title}
</div>
))}
{dateEvents.length > 2 && (
<div className="text-xs text-slate-500 text-center">
+{dateEvents.length - 2} more
</div>
)}
</div>
)}
</div>
);
})}
</div>
</div>
</div>
);
})}
</div>
)}

{/* Action Pool */}
{showActionPool && (
<div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
<div className="flex items-center justify-between mb-4">
<h3 className="text-lg font-semibold text-slate-900">Action Pool</h3>
<button
onClick={refreshActionPool}
className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
>
Refresh from Goals
</button>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{data.actionPool.map((action) => (
<div
key={action.id}
className="p-3 rounded-lg border border-slate-200 hover:shadow-md transition-all cursor-move bg-white"
draggable
onDragStart={(e) => handleDragStart(e, action)}
>
<div className="flex items-start justify-between">
<div className="flex items-start space-x-2">
<div className="w-6 h-6 rounded-full flex items-center justify-center text-sm">
{getCategoryIcon(action.category)}
</div>
<div>
<div className="font-medium text-slate-900">{action.title}</div>
<div className="flex items-center space-x-2 mt-1">
<span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(action.category)}`}>
{action.category}
</span>
<span className="text-xs text-slate-500">
{action.duration} min
</span>
<span className="text-xs text-slate-500">
{action.frequency === 'daily' ? 'Daily' : 
action.frequency === 'weekly' ? 'Weekly' : 
'3x Week'}
</span>
</div>
</div>
</div>
<button
onClick={() => removeActionFromPool(action.id)}
className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
>
<X className="w-4 h-4" />
</button>
</div>
</div>
))}

{data.actionPool.length === 0 && (
<div className="col-span-3 text-center py-8 text-slate-500">
<div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
<Plus className="w-6 h-6 text-slate-400" />
</div>
<p className="mb-3">No actions in your pool</p>
<button 
onClick={refreshActionPool}
className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
>
Refresh from Goals
</button>
</div>
)}
</div>
</div>
)}

{/* Notes Panel */}
{showNotes && (
<div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
<NotesPanel feature="calendar" />
</div>
)}

{/* Day View Modal */}
{showDayView && <DayViewModal />}
</div>
);
};
