import { NoteColor } from '@/types';

export const colorMap: Record<NoteColor, { bg: string; border: string; text: string }> = {
  default: { bg: 'bg-zinc-900', border: 'border-zinc-800', text: 'text-zinc-100' },
  red: { bg: 'bg-red-950/50', border: 'border-red-900/50', text: 'text-red-100' },
  orange: { bg: 'bg-orange-950/50', border: 'border-orange-900/50', text: 'text-orange-100' },
  yellow: { bg: 'bg-yellow-950/50', border: 'border-yellow-900/50', text: 'text-yellow-100' },
  green: { bg: 'bg-green-950/50', border: 'border-green-900/50', text: 'text-green-100' },
  teal: { bg: 'bg-teal-950/50', border: 'border-teal-900/50', text: 'text-teal-100' },
  blue: { bg: 'bg-blue-950/50', border: 'border-blue-900/50', text: 'text-blue-100' },
  purple: { bg: 'bg-purple-950/50', border: 'border-purple-900/50', text: 'text-purple-100' },
  pink: { bg: 'bg-pink-950/50', border: 'border-pink-900/50', text: 'text-pink-100' },
  brown: { bg: 'bg-stone-900', border: 'border-stone-800', text: 'text-stone-100' },
  gray: { bg: 'bg-gray-900', border: 'border-gray-800', text: 'text-gray-100' },
};

export const getTagColor = (tag: string): NoteColor => {
  const colors: NoteColor[] = [
    'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'brown', 'gray'
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
