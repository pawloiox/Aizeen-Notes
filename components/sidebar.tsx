'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Note } from '@/types';
import { X, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onNoteClick: (note: Note) => void;
}

export function Sidebar({ isOpen, onClose, notes, onNoteClick }: SidebarProps) {
  // Sort notes: pinned first, then by updatedAt (newest first)
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                  <Image src="https://imgur.com/iJLXUgO.png" alt="Aizeen Logo" width={32} height={32} className="object-contain" />
                </div>
                <span className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">Notes</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {sortedNotes.length === 0 ? (
                <div className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                  No notes yet
                </div>
              ) : (
                <div className="flex flex-col gap-1 px-2">
                  {sortedNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => {
                        onNoteClick(note);
                        onClose();
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-left group"
                    >
                      {note.pinned ? (
                        <Pin size={16} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                      ) : (
                        <div className="w-4 shrink-0" />
                      )}
                      <div className="flex-1 truncate">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 block truncate">
                          {note.title || 'Untitled'}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 block truncate">
                          {note.content ? note.content.replace(/<[^>]*>?/gm, '') : 'No additional text'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
