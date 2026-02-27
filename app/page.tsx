'use client';

import React, { useState, useMemo } from 'react';
import { useNotes } from '@/hooks/use-notes';
import { NoteCard } from '@/components/note-card';
import { NoteEditor } from '@/components/note-editor';
import { MasonryGrid } from '@/components/masonry-grid';
import { Note } from '@/types';
import { Search, Plus, Menu, LayoutGrid, LayoutList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Sidebar } from '@/components/sidebar';
import { SortableNoteCard } from '@/components/sortable-note-card';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

export default function Home() {
  const { notes, isLoaded, addNote, updateNote, deleteNote, togglePin, reorderNotes } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) => {
        const plainContent = note.content ? note.content.replace(/<[^>]*>?/gm, '') : '';
        return note.title.toLowerCase().includes(query) ||
        plainContent.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query));
      }
    );
  }, [notes, searchQuery]);

  const pinnedNotes = filteredNotes.filter((note) => note.pinned);
  const otherNotes = filteredNotes.filter((note) => !note.pinned);

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    if (editingNote) {
      updateNote(editingNote.id, noteData);
    } else {
      addNote(noteData as Omit<Note, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setIsEditorOpen(false);
    setEditingNote(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, isPinnedGroup: boolean) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const groupNotes = isPinnedGroup ? pinnedNotes : otherNotes;
      const oldIndex = groupNotes.findIndex((note) => note.id === active.id);
      const newIndex = groupNotes.findIndex((note) => note.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderNotes(oldIndex, newIndex, isPinnedGroup);
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-2 border-zinc-200 dark:border-zinc-800 border-t-zinc-500 dark:border-t-zinc-400 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-900 dark:selection:text-zinc-100 font-sans transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
        <div className="w-full px-3 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                <Image src="/img/AizeenLogo.png" alt="Aizeen Logo" width={32} height={32} className="object-contain" />
              </div>
              <span className="text-xl font-medium tracking-tight hidden sm:block">Notes</span>
            </div>
          </div>

          <div className="w-full max-w-2xl px-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search notes, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-100/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:bg-zinc-100 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-300 dark:focus:border-zinc-700 rounded-full py-2.5 pl-11 pr-4 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 outline-none transition-all shadow-sm focus:shadow-md"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hidden sm:block"
              title={viewMode === 'grid' ? 'List view' : 'Grid view'}
            >
              {viewMode === 'grid' ? <LayoutList size={20} /> : <LayoutGrid size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center flex-1 w-full">
        {/* Take a note input */}
        <div className="w-full max-w-2xl mb-12">
          <div
            onClick={handleCreateNote}
            className="w-full bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 cursor-text shadow-sm hover:shadow-md transition-all group"
          >
            <span className="text-zinc-500 flex-1 text-lg group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">Take a note...</span>
            <div className="flex items-center gap-2 text-zinc-500">
              <button className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="w-full">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-2">
              <Image src="https://imgur.com/iJLXUgO.png" alt="Aizeen Logo" width={64} height={64} className="opacity-20 object-contain" />
              <p className="text-lg font-medium">Notes you add appear here</p>
            </div>
          ) : (
            <>
              {pinnedNotes.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-4 ml-2">Pinned</h2>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => handleDragEnd(e, true)}
                  >
                    <SortableContext
                      items={pinnedNotes.map((n) => n.id)}
                      strategy={() => null}
                    >
                      <MasonryGrid columns={viewMode === 'grid' ? { default: 1, sm: 2, md: 3, lg: 4, xl: 5 } : { default: 1 }}>
                        {pinnedNotes.map((note) => (
                          <SortableNoteCard
                            key={note.id}
                            note={note}
                            onClick={() => handleEditNote(note)}
                            onTogglePin={(e) => {
                              e.stopPropagation();
                              togglePin(note.id);
                            }}
                            onDelete={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                          />
                        ))}
                      </MasonryGrid>
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {otherNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <h2 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-4 ml-2">Others</h2>
                  )}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => handleDragEnd(e, false)}
                  >
                    <SortableContext
                      items={otherNotes.map((n) => n.id)}
                      strategy={() => null}
                    >
                      <MasonryGrid columns={viewMode === 'grid' ? { default: 1, sm: 2, md: 3, lg: 4, xl: 5 } : { default: 1 }}>
                        {otherNotes.map((note) => (
                          <SortableNoteCard
                            key={note.id}
                            note={note}
                            onClick={() => handleEditNote(note)}
                            onTogglePin={(e) => {
                              e.stopPropagation();
                              togglePin(note.id);
                            }}
                            onDelete={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                          />
                        ))}
                      </MasonryGrid>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer Logo */}
      <footer className="w-full py-8 flex justify-center items-center mt-auto">
        <a href="https://www.instagram.com/pawloiox/"> 
        <Image 
          src="/img/PAG_logo.png" 
          alt="Developer Logo" 
          width={48} 
          height={48} 
          className="opacity-20 hover:opacity-40 transition-opacity duration-300 object-contain" 
        />
        </a>
      </footer>

      {/* Editor Modal */}
      <NoteEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        note={editingNote}
        onSave={handleSaveNote}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        notes={notes}
        onNoteClick={handleEditNote}
      />
    </div>
  );
}
