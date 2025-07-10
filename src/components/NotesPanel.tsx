import React, { useState } from 'react';
import { 
  StickyNote, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Lightbulb, 
  Target, 
  BookOpen, 
  Heart, 
  Zap, 
  HelpCircle 
} from 'lucide-react';
import { useNotes, Note } from '../hooks/useNotes';

interface NotesPanelProps {
  feature?: Note['related_feature'];
  compact?: boolean;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ feature = 'general', compact = false }) => {
  const { notes, isLoading, error, createNote, updateNote, deleteNote } = useNotes(feature);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'insight' as Note['category']
  });
  const [editNote, setEditNote] = useState({
    title: '',
    content: '',
    category: 'insight' as Note['category']
  });

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    
    await createNote({
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      related_feature: feature
    });
    
    setNewNote({
      title: '',
      content: '',
      category: 'insight'
    });
    
    setIsCreating(false);
  };

  const handleUpdateNote = async (id: string) => {
    if (!editNote.title.trim() || !editNote.content.trim()) return;
    
    await updateNote(id, {
      title: editNote.title,
      content: editNote.content,
      category: editNote.category
    });
    
    setEditingNoteId(null);
  };

  const startEditing = (note: Note) => {
    setEditNote({
      title: note.title,
      content: note.content,
      category: note.category
    });
    setEditingNoteId(note.id);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
  };

  const getCategoryIcon = (category: Note['category']) => {
    switch (category) {
      case 'insight': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'action': return <Target className="w-4 h-4 text-blue-500" />;
      case 'reflection': return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'gratitude': return <Heart className="w-4 h-4 text-red-500" />;
      case 'idea': return <Zap className="w-4 h-4 text-green-500" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryColor = (category: Note['category']) => {
    switch (category) {
      case 'insight': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'action': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'reflection': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'gratitude': return 'bg-red-50 border-red-200 text-red-800';
      case 'idea': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-slate-600 text-sm">Loading notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Error loading notes: {error}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${compact ? '' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StickyNote className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-slate-900">
            {compact ? 'Notes' : `Notes (${notes.length})`}
          </h3>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="p-1 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
          title="Add note"
        >
          {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Create Note Form */}
      {isCreating && (
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <div className="space-y-3">
            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Note title"
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your note here..."
              className="w-full p-2 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-slate-600">Category:</label>
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value as Note['category'] }))}
                  className="p-1 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="insight">Insight</option>
                  <option value="action">Action</option>
                  <option value="reflection">Reflection</option>
                  <option value="gratitude">Gratitude</option>
                  <option value="idea">Idea</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNote}
                  className="flex items-center space-x-1 p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notes yet</p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Add your first note
            </button>
          </div>
        ) : (
          notes.map(note => (
            <div 
              key={note.id} 
              className={`bg-white rounded-lg border shadow-sm transition-all ${
                editingNoteId === note.id ? 'border-purple-300 shadow-md' : 'border-slate-200 hover:shadow'
              }`}
            >
              {editingNoteId === note.id ? (
                <div className="p-4 space-y-3">
                  <input
                    type="text"
                    value={editNote.title}
                    onChange={(e) => setEditNote(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Note title"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  
                  <textarea
                    value={editNote.content}
                    onChange={(e) => setEditNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your note here..."
                    className="w-full p-2 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-slate-600">Category:</label>
                      <select
                        value={editNote.category}
                        onChange={(e) => setEditNote(prev => ({ ...prev, category: e.target.value as Note['category'] }))}
                        className="p-1 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="insight">Insight</option>
                        <option value="action">Action</option>
                        <option value="reflection">Reflection</option>
                        <option value="gratitude">Gratitude</option>
                        <option value="idea">Idea</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={cancelEditing}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateNote(note.id)}
                        className="flex items-center space-x-1 p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                      >
                        <Save className="w-3 h-3" />
                        <span>Update</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-slate-900">{note.title}</h4>
                      <div className={`px-2 py-0.5 rounded-full text-xs flex items-center space-x-1 ${getCategoryColor(note.category)}`}>
                        {getCategoryIcon(note.category)}
                        <span className="capitalize">{note.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => startEditing(note)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit note"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-700 whitespace-pre-line mb-2">{note.content}</p>
                  
                  <div className="text-xs text-slate-500">
                    {formatDate(note.created_at)}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesPanel;