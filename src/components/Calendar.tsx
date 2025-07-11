Here's the fixed version with all missing closing brackets added:

```typescript
// At the end of the file, add these missing closing brackets:

                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* ... existing header content ... */}
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1 flex space-x-1 max-w-md">
        {/* ... existing view selector content ... */}
      </div>

      {/* Calendar Content */}
      <div>
        {currentView === 'daily' && renderDailyView()}
        {currentView === 'weekly' && renderWeeklyView()}
        {currentView === '90-day' && render90DayView()}
        {currentView === 'yearly' && renderYearlyView()}
      </div>

      {/* Add Event Form */}
      {renderAddEventForm()}
      
      {/* Vision Overlay */}
      {renderVisionOverlay()}
      
      {/* Add custom CSS for grid-cols-31 */}
      <style jsx>{`
        .grid-cols-31 {
          display: grid;
          grid-template-columns: repeat(31, minmax(0, 1fr));
        }
      `}</style>
    </div>
  );
};

export default Calendar;
```