'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Note, NoteColor } from '@/types';
import { colorMap } from '@/lib/colors';
import { X, Check, Palette, Tag as TagIcon, Bold, Italic, Underline as UnderlineIcon, List, Image as ImageIcon, Strikethrough, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontSize } from './extensions/font-size';
import { FontSizeDrum } from './font-size-drum';

const extensions = [
  StarterKit,
  Underline,
  TextStyle,
  FontSize,
  Image.configure({
    inline: true,
    HTMLAttributes: {
      class: 'rounded-lg max-w-full h-auto my-2',
    },
  }),
];

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note | null;
  onSave: (note: Partial<Note>) => void;
}

export function NoteEditor({ isOpen, onClose, note, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteColor>('default');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showColors, setShowColors] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showFontSizes, setShowFontSizes] = useState(false);
  const [, forceUpdate] = useState({});

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const toolbarMenuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setShowColors(false);
        setShowTags(false);
      }
      if (toolbarMenuContainerRef.current && !toolbarMenuContainerRef.current.contains(event.target as Node)) {
        setShowFontSizes(false);
      }
    };

    if (showColors || showTags || showFontSizes) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColors, showTags, showFontSizes]);

  const fontSizes = [
    { label: 'Small', value: '12px' },
    { label: 'Normal', value: '16px' },
    { label: 'Large', value: '20px' },
    { label: 'Huge', value: '24px' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        editor.chain().focus().setImage({ src: result }).run();
      };
      reader.readAsDataURL(file);
    }
    // Reset input so the same file can be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  const editor = useEditor({
    extensions,
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    onTransaction: () => {
      forceUpdate({});
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none w-full min-h-[150px] bg-transparent text-lg outline-none placeholder:text-white/30 text-white/90',
      },
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (note) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTitle(note.title);
        setContent(note.content);
        setColor(note.color as NoteColor || 'default');
        setTags(note.tags || []);
        if (editor && editor.getHTML() !== note.content) {
          editor.commands.setContent(note.content);
        }
      } else {
        setTitle('');
        setContent('');
        setColor('default');
        setTags([]);
        if (editor) {
          editor.commands.setContent('');
        }
      }
      
      // Auto focus title or content
      setTimeout(() => {
        if (!note?.title && !note?.content) {
          titleRef.current?.focus();
        } else {
          editor?.commands.focus();
        }
      }, 100);
    }
  }, [isOpen, note, editor]);

  const handleSave = () => {
    const finalContent = editor?.isEmpty ? '' : content;
    
    if (title.trim() || finalContent) {
      onSave({ title, content: finalContent, color, tags });
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleSave();
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const colorClass = colorMap[color] || colorMap.default;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleSave}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full max-w-2xl flex flex-col rounded-3xl border shadow-2xl overflow-hidden',
              colorClass.bg,
              colorClass.border
            )}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <div className="flex flex-col p-6 gap-4">
              <input
                ref={titleRef}
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-white/30 text-white"
              />
              
              {editor && (
                <div className="flex items-center gap-1 mb-2 border-b border-white/10 pb-2 relative" ref={toolbarMenuContainerRef}>
                  <FontSizeDrum editor={editor} />
                  
                  <div className="w-px h-4 bg-white/20 mx-1" />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn(
                      "p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors",
                      editor.isActive('bold') && "bg-white/20 text-white"
                    )}
                    title="Bold"
                  >
                    <Bold size={18} />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn(
                      "p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors",
                      editor.isActive('italic') && "bg-white/20 text-white"
                    )}
                    title="Italic"
                  >
                    <Italic size={18} />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={cn(
                      "p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors",
                      editor.isActive('underline') && "bg-white/20 text-white"
                    )}
                    title="Underline"
                  >
                    <UnderlineIcon size={18} />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={cn(
                      "p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors",
                      editor.isActive('strike') && "bg-white/20 text-white"
                    )}
                    title="Strikethrough"
                  >
                    <Strikethrough size={18} />
                  </button>
                  <div className="w-px h-4 bg-white/20 mx-1" />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn(
                      "p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors",
                      editor.isActive('bulletList') && "bg-white/20 text-white"
                    )}
                    title="Bullet List"
                  >
                    <List size={18} />
                  </button>
                  <div className="w-px h-4 bg-white/20 mx-1" />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    title="Add Image"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}

              <div className="w-full min-h-[150px] cursor-text" onClick={() => editor?.commands.focus()}>
                <EditorContent editor={editor} />
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full bg-black/20 text-white/80"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-white">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-black/10 border-t border-white/10">
              <div className="flex items-center gap-2 relative" ref={menuContainerRef}>
                <button
                  onClick={() => {
                    setShowColors(!showColors);
                    setShowTags(false);
                  }}
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Change color"
                >
                  <Palette size={20} />
                </button>
                
                <button
                  onClick={() => {
                    setShowTags(!showTags);
                    setShowColors(false);
                  }}
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Add tag"
                >
                  <TagIcon size={20} />
                </button>

                <AnimatePresence>
                  {showColors && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-0 mb-2 p-2 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl flex gap-2"
                    >
                      {(Object.keys(colorMap) as NoteColor[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setColor(c);
                            setShowColors(false);
                          }}
                          className={cn(
                            'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center',
                            colorMap[c].bg,
                            color === c ? 'border-white' : 'border-transparent'
                          )}
                        >
                          {color === c && <Check size={14} className="text-white" />}
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {showTags && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-12 mb-2 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl w-64"
                    >
                      <input
                        type="text"
                        placeholder="Add a tag and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={addTag}
                        className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
