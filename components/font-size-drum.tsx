'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Editor } from '@tiptap/react';

interface FontSizeDrumProps {
  editor: Editor;
}

export function FontSizeDrum({ editor }: FontSizeDrumProps) {
  const [fontSize, setFontSize] = useState(16);
  const [direction, setDirection] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const accumulatedDelta = useRef(0);
  const fontSizeRef = useRef(fontSize);

  useEffect(() => {
    fontSizeRef.current = fontSize;
  }, [fontSize]);

  useEffect(() => {
    const updateFontSize = () => {
      const currentFontSize = fontSizeRef.current;
      const size = editor.getAttributes('textStyle').fontSize;
      if (size) {
        const parsed = parseInt(size, 10);
        if (!isNaN(parsed)) {
          if (parsed !== currentFontSize) {
            setDirection(parsed > currentFontSize ? 1 : -1);
            setFontSize(parsed);
          }
          return;
        }
      }
      if (currentFontSize !== 16) {
        setDirection(16 > currentFontSize ? 1 : -1);
        setFontSize(16);
      }
    };

    editor.on('selectionUpdate', updateFontSize);
    editor.on('transaction', updateFontSize);

    return () => {
      editor.off('selectionUpdate', updateFontSize);
      editor.off('transaction', updateFontSize);
    };
  }, [editor]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Accumulate delta to handle smooth scrolling devices (like trackpads)
      accumulatedDelta.current += e.deltaY;
      
      // Threshold for changing font size
      if (Math.abs(accumulatedDelta.current) >= 15) {
        const delta = accumulatedDelta.current > 0 ? -1 : 1;
        accumulatedDelta.current = 0; // Reset after triggering
        
        const prev = fontSizeRef.current;
        const newSize = Math.max(8, Math.min(120, prev + delta));
        if (newSize !== prev) {
          setDirection(delta);
          setFontSize(newSize);
          editor.chain().setFontSize(`${newSize}px`).run();
        }
      }
    };

    let touchStartY = 0;
    let touchAccumulated = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchAccumulated = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault(); // Prevent scrolling the page
      }
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY; // Positive when moving up
      
      touchAccumulated += deltaY;
      touchStartY = touchY; // Reset for next move
      
      if (Math.abs(touchAccumulated) >= 5) {
        const delta = touchAccumulated > 0 ? 1 : -1;
        touchAccumulated = 0;
        
        const prev = fontSizeRef.current;
        const newSize = Math.max(8, Math.min(120, prev + delta));
        if (newSize !== prev) {
          setDirection(delta);
          setFontSize(newSize);
          editor.chain().setFontSize(`${newSize}px`).run();
        }
      }
    };
    
    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      el.removeEventListener('wheel', handleNativeWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [editor]);

  const variants = {
    initial: (d: number) => ({ y: d > 0 ? 15 : -15, opacity: 0, rotateX: d > 0 ? -60 : 60 }),
    animate: { y: 0, opacity: 1, rotateX: 0 },
    exit: (d: number) => ({ y: d > 0 ? -15 : 15, opacity: 0, rotateX: d > 0 ? 60 : -60 }),
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-8 w-14 overflow-hidden flex items-center justify-center rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-ns-resize select-none mx-1"
      style={{ perspective: '200px' }}
      title="Scroll to change font size"
    >
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={fontSize}
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute text-sm font-medium tabular-nums flex items-center gap-0.5"
        >
          {fontSize}<span className="text-[10px] opacity-50">px</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
