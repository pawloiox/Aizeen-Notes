'use client';

import { Note, NoteColor } from '@/types';
import { colorMap } from '@/lib/colors';
import { motion } from 'motion/react';
import { Pin, PinOff, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function NoteCard({ note, onClick, onTogglePin, onDelete }: NoteCardProps) {
  const colorClass = colorMap[note.color as NoteColor] || colorMap.default;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      className={cn(
        'group relative flex flex-col gap-2 rounded-2xl border p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        'break-inside-avoid mb-4 w-full',
        colorClass.bg,
        colorClass.border,
        colorClass.text
      )}
    >
      {note.title && (
        <h3 className="font-semibold text-lg leading-tight pr-12">{note.title}</h3>
      )}
      
      {note.content && (
        <div 
          className={cn(
            "tiptap-editor text-sm opacity-90 line-clamp-6",
            !note.title && "pr-12"
          )}
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      )}

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full bg-black/20 text-white/80"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions (visible on hover) */}
      <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-10">
        <button
          onClick={onTogglePin}
          className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
          title={note.pinned ? 'Unpin' : 'Pin'}
        >
          {note.pinned ? <PinOff size={16} /> : <Pin size={16} />}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-full bg-black/20 hover:bg-red-500/80 text-white/80 hover:text-white transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Pin indicator (always visible if pinned) */}
      {note.pinned && (
        <div className="absolute top-3 right-3 group-hover:hidden text-white/50 z-10">
          <Pin size={16} />
        </div>
      )}
    </motion.div>
  );
}
