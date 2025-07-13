Here's the fixed version with all missing closing brackets added:

```javascript
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{action.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{action.category}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeActionFromPool(action.id)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 90-Day View */}
      {viewMode === '90day' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          {/* Month Groups */}
          {Object.entries(monthGroups).map(([monthKey, dates]) => (
            <div key={monthKey} className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                {dates[0].toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {dates.map((date, index) => {
                  const dayMilestones = milestones.filter(m => 
                    m.date.toDateString() === date.toDateString()
                  );

                  return (
                    <div 
                      key={index}
                      className="p-2 border rounded-lg hover:border-blue-500 cursor-pointer"
                      onClick={() => openDayView(date)}
                    >
                      <div className="text-sm font-medium">{date.getDate()}</div>
                      {dayMilestones.map((milestone, i) => (
                        <div 
                          key={i}
                          className={`mt-1 p-1 rounded text-xs ${getCategoryColor(milestone.category)}`}
                        >
                          {milestone.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Day View Modal */}
      {showDayView && <DayViewModal />}

      {/* Notes Panel */}
      <NotesPanel 
        show={showNotes} 
        onClose={() => setShowNotes(false)} 
      />
    </div>
  );
};

export default Calendar;
```