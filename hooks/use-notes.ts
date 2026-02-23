'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types';

const STORAGE_KEY = 'aesthetic-notes-data';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNotes(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse notes from local storage', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const updateNote = (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const togglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned, updatedAt: Date.now() } : note
      )
    );
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
  };
}
