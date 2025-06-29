import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
}

// Create Supabase client with validated environment variables
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'insight' | 'action' | 'reflection' | 'gratitude' | 'idea' | 'other';
  related_feature: 'wheel' | 'values' | 'vision' | 'goals' | 'calendar' | 'general';
  created_at: string;
  updated_at: string;
}

export const useNotes = (feature?: Note['related_feature']) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load notes on mount or when feature changes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let query = supabase
          .from('user_notes')
          .select('*')
          .order('created_at', { ascending: false });

        // Filter by feature if provided
        if (feature) {
          query = query.eq('related_feature', feature);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(error.message);
        }

        setNotes(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notes');
        console.error('Error loading notes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [feature]);

  // Create a new note
  const createNote = useCallback(async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('user_notes')
        .insert(note)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setNotes(prev => [data, ...prev]);
      setLastSaved(new Date());
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
      console.error('Error creating note:', err);
      return null;
    }
  }, []);

  // Update an existing note
  const updateNote = useCallback(async (id: string, updates: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('user_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setNotes(prev => prev.map(note => note.id === id ? data : note));
      setLastSaved(new Date());
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      console.error('Error updating note:', err);
      return null;
    }
  }, []);

  // Delete a note
  const deleteNote = useCallback(async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('user_notes')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setNotes(prev => prev.filter(note => note.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      console.error('Error deleting note:', err);
      return false;
    }
  }, []);

  // Get notes by category
  const getNotesByCategory = useCallback((category: Note['category']) => {
    return notes.filter(note => note.category === category);
  }, [notes]);

  return {
    notes,
    isLoading,
    error,
    lastSaved,
    createNote,
    updateNote,
    deleteNote,
    getNotesByCategory
  };
};