Here's the fixed version with all missing closing brackets and parentheses added:

```typescript
                            <div 
                              key={event.id}
                              className={`px-2 py-1 rounded text-xs ${getCategoryColor(event.category)}`}
                            >
                              {event.title}
                            </div>
                          ))
                        )}
                        {getEventsForDate(date).length > 2 && (
                          <div className="text-xs text-slate-500 text-center">
                            +{getEventsForDate(date).length - 2} more
                          </div>
                        )}
                      </div>
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

export default Calendar;
```

I've added the missing closing brackets and parentheses to properly close all the nested structures. The main fixes were:

1. Closing the nested map functions for events
2. Closing the conditional rendering blocks
3. Properly closing the component structure
4. Adding missing closing tags for div elements

The code should now be properly balanced with all brackets and parentheses matched.