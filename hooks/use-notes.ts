'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

const STORAGE_KEY = 'aesthetic-notes-data';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadNotes = async () => {
      if (user) {
        // Database mode
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('updatedAt', { ascending: false });

        if (!error && data) {
          setNotes(data as Note[]);
        }

        // Check for local notes to migrate
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const localNotes: Note[] = JSON.parse(stored);
            if (localNotes.length > 0) {
              // Migrate local notes to database
              const notesToInsert = localNotes.map(n => ({
                ...n,
                user_id: user.id,
                createdAt: typeof n.createdAt === 'number' ? new Date(n.createdAt).toISOString() : n.createdAt,
                updatedAt: typeof n.updatedAt === 'number' ? new Date(n.updatedAt).toISOString() : n.updatedAt,
              }));
              
              const { error: insertError } = await supabase
                .from('notes')
                .insert(notesToInsert);
                
              if (!insertError) {
                localStorage.removeItem(STORAGE_KEY);
                // Refresh notes
                const { data: refreshedData } = await supabase
                  .from('notes')
                  .select('*')
                  .order('updatedAt', { ascending: false });
                if (refreshedData) {
                  setNotes(refreshedData as Note[]);
                }
              } else {
                console.error('Migration insert error:', insertError);
              }
            } else {
              localStorage.removeItem(STORAGE_KEY);
            }
          } catch (e) {
            console.error('Failed to parse local notes for migration', e);
          }
        }
      } else {
        // Local mode
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            setNotes(JSON.parse(stored));
          } catch (e) {
            console.error('Failed to parse notes from local storage', e);
          }
        } else {
          setNotes([]);
        }
      }
      setIsLoaded(true);
    };

    loadNotes();
  }, [user]);

  useEffect(() => {
    if (isLoaded && !user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, isLoaded, user]);

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: note.pinned || false,
      tags: note.tags || [],
      image_urls: note.image_urls || [],
    };
    
    setNotes((prev) => [newNote, ...prev]);

    if (user) {
      const { error } = await supabase.from('notes').insert({
        ...newNote,
        user_id: user.id
      });
      if (error) {
        console.error('Error inserting note:', error);
      }
    }
  };

  const updateNote = async (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    const updatedAt = new Date().toISOString();
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt } : note
      )
    );

    if (user) {
      const { error } = await supabase.from('notes').update({ ...updates, updatedAt }).eq('id', id);
      if (error) {
        console.error('Error updating note:', error);
      }
    }
  };

  const deleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));

    if (user) {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const togglePin = async (id: string) => {
    const noteToUpdate = notes.find(n => n.id === id);
    if (!noteToUpdate) return;
    
    const newPinned = !noteToUpdate.pinned;
    const updatedAt = new Date().toISOString();
    
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, pinned: newPinned, updatedAt } : note
      )
    );

    if (user) {
      const { error } = await supabase.from('notes').update({ pinned: newPinned, updatedAt }).eq('id', id);
      if (error) {
        console.error('Error toggling pin:', error);
      }
    }
  };

  const reorderNotes = (startIndex: number, endIndex: number, isPinnedGroup: boolean) => {
    setNotes((prev) => {
      const pinnedNotes = prev.filter(n => n.pinned);
      const otherNotes = prev.filter(n => !n.pinned);
      
      if (isPinnedGroup) {
        const result = Array.from(pinnedNotes);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return [...result, ...otherNotes];
      } else {
        const result = Array.from(otherNotes);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return [...pinnedNotes, ...result];
      }
    });
  };

  return {
    notes,
    isLoaded,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    reorderNotes,
    user,
  };
}
