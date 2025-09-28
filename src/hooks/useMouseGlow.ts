"use client"

import { useEffect, useRef } from 'react';

export const useMouseGlow = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let isPressed = false;
    let animationFrameId: number;

    const updateGlowPosition = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate relative position as percentages with slight smoothing
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      
      // Use requestAnimationFrame for smoother updates
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(() => {
        element.style.setProperty('--mouse-x', `${xPercent}%`);
        element.style.setProperty('--mouse-y', `${yPercent}%`);
        
        // Enhance glow intensity when pressed/dragging
        if (isPressed) {
          element.style.setProperty('--glow-intensity', '1.3');
          element.style.setProperty('--glow-size', '650px');
        } else {
          element.style.setProperty('--glow-intensity', '1');
          element.style.setProperty('--glow-size', '600px');
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateGlowPosition(e);
    };

    const handleMouseEnter = () => {
      element.style.setProperty('--glow-opacity', '1');
      element.style.setProperty('--glow-transition', 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)');
    };

    const handleMouseLeave = () => {
      element.style.setProperty('--glow-opacity', '0');
      element.style.setProperty('--glow-transition', 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)');
      isPressed = false;
      element.style.setProperty('--glow-intensity', '1');
      element.style.setProperty('--glow-size', '800px');
    };

    const handleMouseDown = () => {
      isPressed = true;
      element.style.setProperty('--glow-transition', 'all 100ms cubic-bezier(0.4, 0, 0.2, 1)');
    };

    const handleMouseUp = () => {
      isPressed = false;
      element.style.setProperty('--glow-transition', 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)');
    };

    // Global mouse up to handle cases where mouse is released outside element
    const handleGlobalMouseUp = () => {
      isPressed = false;
      if (element) {
        element.style.setProperty('--glow-intensity', '1');
        element.style.setProperty('--glow-size', '600px');
        element.style.setProperty('--glow-transition', 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)');
      }
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    // Initialize CSS variables with enhanced values
    element.style.setProperty('--mouse-x', '50%');
    element.style.setProperty('--mouse-y', '50%');
    element.style.setProperty('--glow-opacity', '0');
    element.style.setProperty('--glow-intensity', '1');
    element.style.setProperty('--glow-size', '600px');
    element.style.setProperty('--glow-transition', 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)');

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return elementRef;
};
